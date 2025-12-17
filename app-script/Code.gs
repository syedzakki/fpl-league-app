/**********************************************
 * Complete Code.gs - FPL Auto-Updater + Debug (append historic)
 * - Uses only API automatic_subs for substitutions
 * - Appends to FPL_Debug when GW changes (historic log)
 * - Removes team 9388548 from debug output
 * - Computes FreeTransfersLeft if API doesn't provide (carry-forward logic)
 * - Free transfer cap = 5 (per FPL 2024/25 rule change)
 * - Writes last-updated timestamp to main sheet cell A2
 **********************************************/

/* ---------- CONFIG ---------- */
var SHEET_NAME = 'Sheet1';
var TEAM_ID_RANGE = 'B3:H3';
var GW_START_ROW = 5;            // row index for GW1 (B5 / K5)
var GAMEWEEK_OUTPUT_COL = 2;     // B
var CAPTAIN_OUTPUT_COL = 11;     // K
var MAX_GAMEWEEKS = 38;
var LEAGUE_ID = 1417390;
var LEAGUE_SHEET_PREFIX = 'League_';
var DEBUG_SHEET_NAME = 'FPL_Debug';
var TIMESTAMP_CELL = 'A2';       // user requested A2
var SKIP_DEBUG_TEAM_ID = 9388548; // do not include this team in debug
var FREE_TRANSFER_CAP = 5;      // official cap (2024/25): up to 5 can be banked
var DEFAULT_STARTING_FT = 1;    // fallback starting free transfers at GW1 (changeable)
/* ---------------------------- */

/* ========== Public: entry point ========== */
function updateFPLCurrentGWPoints() {
  var currentGw = detectCurrentGameweekFromFPL();
  if (!currentGw) {
    Logger.log('Could not detect current/next gameweek from FPL API.');
    _writeMainLastUpdated();
    return;
  }
  updateFPLForGW(currentGw);
}

/* Detect current/next gameweek */
function detectCurrentGameweekFromFPL() {
  var bootstrapUrl = 'https://fantasy.premierleague.com/api/bootstrap-static/';
  try {
    var resp = UrlFetchApp.fetch(bootstrapUrl, { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) {
      Logger.log('Bootstrap fetch failed code=' + resp.getResponseCode());
      return null;
    }
    var data = JSON.parse(resp.getContentText());
    if (!Array.isArray(data.events)) return null;
    var current = data.events.find(function(e){ return e.is_current === true; });
    if (current) return current.id;
    var nextE = data.events.find(function(e){ return e.is_next === true; });
    if (nextE) return nextE.id;
    var upcoming = data.events.find(function(e){ return e.finished === false; });
    if (upcoming) return upcoming.id;
    return null;
  } catch (e) {
    Logger.log('Error detecting current GW: ' + e);
    return null;
  }
}

/* ========== Main updater (uses API automatic_subs only) ========== */
function updateFPLForGW(gw) {
  if (!gw || isNaN(gw) || gw <= 0 || gw > MAX_GAMEWEEKS) {
    throw new Error('Invalid GW: ' + gw);
  }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Sheet not found: ' + SHEET_NAME);

  // read team IDs (we will skip SKIP_DEBUG_TEAM_ID for debug rows)
  var teamIdsRaw = sheet.getRange(TEAM_ID_RANGE).getValues()[0];
  var teamIds = teamIdsRaw.map(function(v){ return (v === '' ? null : (isNaN(v) ? v : Number(v))); });
  var numTeams = teamIds.length;

  // fetch bootstrap-static for names + canonical types
  var idToName = {};
  var bootstrapElementType = {};
  try {
    var bresp = UrlFetchApp.fetch('https://fantasy.premierleague.com/api/bootstrap-static/', { muteHttpExceptions: true });
    if (bresp.getResponseCode() === 200) {
      var bdata = JSON.parse(bresp.getContentText());
      if (Array.isArray(bdata.elements)) {
        for (var bi = 0; bi < bdata.elements.length; bi++) {
          var p = bdata.elements[bi];
          var nm = p.web_name ? p.web_name : ((p.first_name || '') + (p.second_name ? (' ' + p.second_name) : ''));
          idToName[p.id] = nm || ('#' + p.id);
          var bt = (typeof p.element_type !== 'undefined') ? Number(p.element_type) : null;
          if (isNaN(bt)) bt = null;
          bootstrapElementType[p.id] = bt;
        }
      }
    }
  } catch (e) {
    Logger.log('bootstrap fetch failed: ' + e);
  }

  // fetch live event data (points, minutes, live element_type)
  var playerPoints = {};
  var playerMinutes = {};
  var playerElementType = {};
  try {
    var liveUrl = 'https://fantasy.premierleague.com/api/event/' + gw + '/live/';
    var liveResp = UrlFetchApp.fetch(liveUrl, { muteHttpExceptions: true });
    if (liveResp.getResponseCode() !== 200) {
      Logger.log('Live data fetch failed for GW' + gw + ' code=' + liveResp.getResponseCode());
      var errRow = Array(numTeams).fill('ERR');
      sheet.getRange(GW_START_ROW + gw - 1, GAMEWEEK_OUTPUT_COL, 1, numTeams).setValues([errRow]);
      sheet.getRange(GW_START_ROW + gw - 1, CAPTAIN_OUTPUT_COL, 1, numTeams).setValues([errRow]);
      _writeMainLastUpdated();
      return;
    }
    var liveData = JSON.parse(liveResp.getContentText());
    if (Array.isArray(liveData.elements)) {
      for (var li = 0; li < liveData.elements.length; li++) {
        var e = liveData.elements[li];
        var pts = e && e.stats && typeof e.stats.total_points === 'number' ? e.stats.total_points : 0;
        var mins = e && e.stats && typeof e.stats.minutes === 'number' ? e.stats.minutes : 0;
        var etRaw = (typeof e.element_type !== 'undefined') ? e.element_type : (typeof e.type !== 'undefined' ? e.type : null);
        var et = (etRaw === null || typeof etRaw === 'undefined') ? null : Number(etRaw);
        if (isNaN(et)) et = null;
        playerPoints[e.id] = pts;
        playerMinutes[e.id] = mins;
        playerElementType[e.id] = et;
      }
    }
  } catch (e) {
    Logger.log('Exception fetching live: ' + e);
    var errRow2 = Array(numTeams).fill('ERR');
    sheet.getRange(GW_START_ROW + gw - 1, GAMEWEEK_OUTPUT_COL, 1, numTeams).setValues([errRow2]);
    sheet.getRange(GW_START_ROW + gw - 1, CAPTAIN_OUTPUT_COL, 1, numTeams).setValues([errRow2]);
    _writeMainLastUpdated();
    return;
  }

  // Build prevFreeMap from existing FPL_Debug (last recorded free-transfers for each team)
  var prevFreeMap = {}; // teamId -> {gw: n, free: m}
  try {
    var dbgSheet = ss.getSheetByName(DEBUG_SHEET_NAME);
    if (dbgSheet && dbgSheet.getLastRow() >= 2) {
      var dr = dbgSheet.getLastRow();
      var vals = dbgSheet.getRange(2,1,dr-1, dbgSheet.getLastColumn()).getValues();
      // header: ['Timestamp','Gameweek','TeamID', ... 'FreeTransfersLeft', ...]
      // FreeTransfersLeft is at index 8 (0-based) per our header layout
      for (var r = 0; r < vals.length; r++) {
        var row = vals[r];
        var rowGw = Number(row[1]);
        var rowTeam = row[2];
        var rowFreeRaw = row[8];
        var freeNum = null;
        if (rowFreeRaw === '' || typeof rowFreeRaw === 'undefined' || rowFreeRaw === null) freeNum = null;
        else {
          // try to parse integer from text like '0 (negated by wildcard)' or '3'
          var m = String(rowFreeRaw).match(/(-?\d+)/);
          freeNum = m ? Number(m[1]) : null;
        }
        if (!rowTeam) continue;
        // Only consider previous gameweeks < current gw
        if (rowGw < gw && freeNum !== null) {
          var existing = prevFreeMap[rowTeam];
          if (!existing || (existing && existing.gw < rowGw)) {
            prevFreeMap[rowTeam] = { gw: rowGw, free: freeNum };
          }
        }
      }
    }
  } catch (e) {
    Logger.log('Could not build prevFreeMap: ' + e);
  }

  // prepare batch requests for picks/transfers/entry
  var picksRequests = [];
  var transfersRequests = [];
  var entryRequests = [];
  var picksIndexToTeamCol = [];
  for (var c = 0; c < numTeams; c++) {
    var tId = teamIds[c];
    if (tId === null || tId === '' || isNaN(tId)) continue;
    // We still fetch picks/transfers/entry for calculation outputs, but we will skip adding debug rows for SKIP_DEBUG_TEAM_ID
    picksRequests.push({ url: 'https://fantasy.premierleague.com/api/entry/' + tId + '/event/' + gw + '/picks/', muteHttpExceptions: true });
    transfersRequests.push({ url: 'https://fantasy.premierleague.com/api/entry/' + tId + '/transfers/', muteHttpExceptions: true });
    entryRequests.push({ url: 'https://fantasy.premierleague.com/api/entry/' + tId + '/', muteHttpExceptions: true });
    picksIndexToTeamCol.push(c);
  }

  var gwOutputRow = Array(numTeams).fill('');
  var capvcOutputRow = Array(numTeams).fill('');
  var debugRowsToAppend = []; // collect only rows we will append to debug sheet

  if (picksRequests.length === 0) {
    sheet.getRange(GW_START_ROW + gw - 1, GAMEWEEK_OUTPUT_COL, 1, numTeams).setValues([gwOutputRow]);
    sheet.getRange(GW_START_ROW + gw - 1, CAPTAIN_OUTPUT_COL, 1, numTeams).setValues([capvcOutputRow]);
    _writeMainLastUpdated();
    Logger.log('No teams configured in ' + TEAM_ID_RANGE);
    return;
  }

  // batch fetch picks (required) and transfers/entry (best-effort)
  var picksResponses;
  try { picksResponses = UrlFetchApp.fetchAll(picksRequests); } catch (e) { Logger.log('fetchAll picks failed: ' + e); var errRow3 = Array(numTeams).fill('ERR'); sheet.getRange(GW_START_ROW + gw - 1, GAMEWEEK_OUTPUT_COL, 1, numTeams).setValues([errRow3]); sheet.getRange(GW_START_ROW + gw - 1, CAPTAIN_OUTPUT_COL, 1, numTeams).setValues([errRow3]); _writeMainLastUpdated(); return; }
  var transfersResponses = [], entryResponses = [];
  try { transfersResponses = UrlFetchApp.fetchAll(transfersRequests); entryResponses = UrlFetchApp.fetchAll(entryRequests); } catch (e) { Logger.log('fetchAll transfers/entry failed: ' + e); }

  var now = new Date();
  for (var i = 0; i < picksResponses.length; i++) {
    var resp = picksResponses[i];
    var col = picksIndexToTeamCol[i];
    var teamId = teamIds[col];

    // debug defaults
    var teamName = '', transfersMade = 0, transferCost = 0, pointsDeducted = '', freeTransfersLeft = '', activeChip = '', chipEffect = '', subsAppliedReadable = '', autoSubsReadable = '', benchUsedNames = '', notes = '', detailedNotes = '';
    var transfersList = [];

    try {
      if (resp.getResponseCode() !== 200) {
        Logger.log('WARN: Picks fetch failed for col ' + (col+1) + ' code=' + resp.getResponseCode());
        gwOutputRow[col] = 'ERR'; capvcOutputRow[col] = 'ERR';
        // skip debug append for this team; or mark error row if not skipped team
        if (teamId !== SKIP_DEBUG_TEAM_ID) {
          debugRowsToAppend.push([now, gw, teamId, '', 0, '', 0, 'ERR', '', '', '', '', '', '', 'Picks fetch error', 'Picks fetch error']);
        }
        continue;
      }

      var picksData = JSON.parse(resp.getContentText());
      var picks = Array.isArray(picksData.picks) ? picksData.picks : [];

      // team name & free transfers from entry response (preferred)
      try {
        var eresp = entryResponses && entryResponses[i] ? entryResponses[i] : null;
        if (eresp && eresp.getResponseCode && eresp.getResponseCode() === 200) {
          var ed = JSON.parse(eresp.getContentText());
          teamName = ed && (ed.player_name || ed.name) || '';
          // Try multiple known fields - some endpoints differ
          if (ed && ed.entry && typeof ed.entry.event_transfers !== 'undefined') freeTransfersLeft = ed.entry.event_transfers;
          if (!freeTransfersLeft && ed && ed.entry_history && typeof ed.entry_history.free_transfers !== 'undefined') freeTransfersLeft = ed.entry_history.free_transfers;
          // older endpoints may have free_transfers directly in the entry object:
          if (!freeTransfersLeft && typeof ed.free_transfers !== 'undefined') freeTransfersLeft = ed.free_transfers;
        }
      } catch (e) { /* ignore */ }

      // transfers info
      try {
        var tResp = transfersResponses && transfersResponses[i] ? transfersResponses[i] : null;
        if (tResp && tResp.getResponseCode && tResp.getResponseCode() === 200) {
          var tdata = JSON.parse(tResp.getContentText());
          if (Array.isArray(tdata)) transfersList = tdata;
          else if (Array.isArray(tdata.transfers)) transfersList = tdata.transfers;
          else if (Array.isArray(tdata.results)) transfersList = tdata.results;
        }
        transfersMade = transfersList.length;
        transferCost = transfersList.reduce(function(s,t){ return s + (t.cost || 0); }, 0);
        pointsDeducted = transferCost;
      } catch (e) { Logger.log('transfer read warn: ' + e); }

      // normalize chip info
      activeChip = (picksData.active_chip || picksData.active_chip_name || picksData.chip || '') || '';
      var chip = (activeChip || '').toString().toLowerCase();
      var chipMap = {
        'benchboost':'benchboost','bboost':'benchboost','bench_boost':'benchboost',
        '3xc':'triple','triple':'triple','triple_captain':'triple','3xcaptain':'triple',
        'wildcard':'wildcard','wc':'wildcard',
        'freehit':'freehit','free_hit':'freehit','fh':'freehit'
      };
      var normChip = chipMap[chip] || (chip || '');
      if (normChip === 'benchboost') chipEffect = 'Bench Boost - include bench';
      else if (normChip === 'triple') chipEffect = 'Triple Captain';
      else if (normChip === 'wildcard') chipEffect = 'Wildcard';
      else if (normChip === 'freehit') chipEffect = 'Free Hit';
      if (normChip === 'wildcard' || normChip === 'freehit') {
        pointsDeducted = '0 (negated by ' + normChip + ')';
        notes += 'Transfer hit negated by ' + normChip + '. ';
      }

      // build picksByPos
      var picksByPos = {};
      for (var pi = 0; pi < picks.length; pi++) {
        var pos = (typeof picks[pi].position !== 'undefined' && picks[pi].position !== null) ? picks[pi].position : (pi + 1);
        picksByPos[pos] = picks[pi];
      }

      // Automatic subs from API (authoritative)
      var autoSubs = picksData.automatic_subs || picksData.automatic_substitutions || [];
      var autoSubsArr = Array.isArray(autoSubs) ? autoSubs : [];
      var autoSubsRead = [];
      for (var a = 0; a < autoSubsArr.length; a++) {
        var s = autoSubsArr[a];
        var outId = s.element_out || s.elementOut || s.element_out_id;
        var inId = s.element_in || s.elementIn || s.element_in_id;
        autoSubsRead.push((idToName[outId] || ('#' + outId)) + ' → ' + (idToName[inId] || ('#' + inId)));
      }
      autoSubsReadable = autoSubsRead.join('; ');

      // includedElements = starters 1..11 then apply automatic_subs mapping
      var includedElements = [];
      for (var pos = 1; pos <= 11; pos++) {
        var pick = picksByPos[pos];
        includedElements.push(pick ? pick.element : null);
      }

      // apply API subs
      var subsApplied = [];
      for (var sIdx = 0; sIdx < autoSubsArr.length; sIdx++) {
        var sub = autoSubsArr[sIdx];
        var outId = sub.element_out || sub.elementOut || sub.element_out_id;
        var inId = sub.element_in || sub.elementIn || sub.element_in_id;
        var idx = includedElements.indexOf(outId);
        if (idx !== -1) {
          includedElements[idx] = inId;
          subsApplied.push((idToName[outId] || ('#'+outId)) + ' → ' + (idToName[inId] || ('#'+inId)));
        } else {
          Logger.log('automatic_sub indicates outId not in starters for team ' + teamId + ': ' + outId);
        }
      }
      subsAppliedReadable = subsApplied.join('; ');

      // bench boost: include bench (12..15)
      var benchBoostActive = (normChip === 'benchboost');
      if (benchBoostActive) {
        for (var bp = 12; bp <= 15; bp++) {
          var bpick = picksByPos[bp];
          if (bpick) {
            includedElements.push(bpick.element);
            benchUsedNames += (benchUsedNames ? ', ' : '') + (idToName[bpick.element] || ('#' + bpick.element));
          }
        }
      }

      // sum teamBase
      var teamBase = 0;
      for (var ei = 0; ei < includedElements.length; ei++) {
        var eid = includedElements[ei];
        if (!eid) continue;
        teamBase += (playerPoints[eid] || 0);
      }

      // captain multiplier detection
      var explicitDoublePick = picks.find(function(p){ return typeof p.multiplier === 'number' && p.multiplier >= 2; });
      var capMultiplier = 2;
      if (normChip.indexOf('triple') > -1) capMultiplier = 3;
      if (explicitDoublePick && typeof explicitDoublePick.multiplier === 'number') capMultiplier = explicitDoublePick.multiplier;

      // choose doubledPickElement
      var doubledPickElement = null;
      if (explicitDoublePick) doubledPickElement = explicitDoublePick.element;
      else {
        var capPick = picks.find(function(p){ return p.is_captain; });
        var vicePick = picks.find(function(p){ return p.is_vice_captain; });
        var capId = capPick ? capPick.element : null;
        var viceId = vicePick ? vicePick.element : null;
        var capPlayed = capId && ((playerMinutes[capId] || 0) > 0 || (playerPoints[capId] || 0) > 0);
        var vicePlayed = viceId && ((playerMinutes[viceId] || 0) > 0 || (playerPoints[viceId] || 0) > 0);
        if (capPlayed) doubledPickElement = capId;
        else if (vicePlayed) doubledPickElement = viceId;
        else doubledPickElement = capId;
      }

      // apply captain multiplier extra
      var teamTotal = teamBase;
      if (doubledPickElement && includedElements.indexOf(doubledPickElement) !== -1) {
        var addExtra = (capMultiplier - 1) * (playerPoints[doubledPickElement] || 0);
        teamTotal += addExtra;
      }

      // CAP+VC sum
      var vicePick2 = picks.find(function(p){ return p.is_vice_captain; });
      var viceEl = vicePick2 ? vicePick2.element : null;
      var capVcSum = 0;
      if (doubledPickElement) {
        capVcSum = (playerPoints[doubledPickElement] || 0) * capMultiplier;
        if (viceEl && viceEl !== doubledPickElement) capVcSum += (playerPoints[viceEl] || 0);
      } else {
        var capSingle = (picks.find(function(p){ return p.is_captain; }) || {}).element;
        capVcSum = (playerPoints[capSingle] || 0) + (playerPoints[viceEl] || 0);
      }

      // write outputs
      gwOutputRow[col] = Number(teamTotal) || 0;
      capvcOutputRow[col] = Number(capVcSum) || 0;

      // ---------- Compute FreeTransfersLeft if missing ----------
      // Use API if available in freeTransfersLeft variable earlier; else compute using prevFreeMap
      var computedFreeLeft = null;
      if (typeof freeTransfersLeft !== 'undefined' && freeTransfersLeft !== '' && freeTransfersLeft !== null) {
        // use API-provided numeric when possible
        var m = String(freeTransfersLeft).match(/(-?\d+)/);
        computedFreeLeft = m ? Number(m[1]) : null;
      }
      if (computedFreeLeft === null) {
        // fallback compute:
        var prevObj = prevFreeMap[teamId];
        var prevFree = prevObj ? Number(prevObj.free) : null;
        if (prevFree === null || isNaN(prevFree)) {
          // if no previous data and GW==1 assume DEFAULT_STARTING_FT else assume 0 carried from before season
          prevFree = (gw === 1 ? DEFAULT_STARTING_FT : 0);
        }
        // weekly allotment is 1
        var newFree = Math.min(prevFree + 1, FREE_TRANSFER_CAP);
        // if Wildcard or FreeHit used, transfers that GW should NOT consume saved transfers
        var transfersConsumed = transfersList.length || 0;
        if (normChip === 'freehit' || normChip === 'wildcard') {
          transfersConsumed = 0;
        }
        // but if the player used bench boost or triple captain those don't affect transfers consumption.
        var freeLeft = newFree - transfersConsumed;
        if (freeLeft < 0) freeLeft = 0;
        computedFreeLeft = freeLeft;
      }

      // produce display string: if chip negated hits, we previously set pointsDeducted text, but computedFreeLeft is numeric
      freeTransfersLeft = computedFreeLeft;

      // ---------- Prepare debug row and append only if teamId != SKIP_DEBUG_TEAM_ID ----------
      if (teamId !== SKIP_DEBUG_TEAM_ID) {
        debugRowsToAppend.push([
          now,
          gw,
          teamId,
          teamName || '',
          transfersMade,
          (transfersMade > 0 ? transfersListToString(transfersList, idToName) : ''),
          transferCost,
          pointsDeducted,
          (typeof freeTransfersLeft !== 'undefined' && freeTransfersLeft !== null ? freeTransfersLeft : ''),
          picksData.active_chip || picksData.active_chip_name || '',
          chipEffect || '',
          subsAppliedReadable || '',
          autoSubsReadable || '',
          benchUsedNames || '',
          notes || '',
          detailedNotes || ''
        ]);
      }

    } catch (e) {
      Logger.log('Error processing picks for col ' + (col+1) + ': ' + e);
      gwOutputRow[col] = 'ERR'; capvcOutputRow[col] = 'ERR';
      if (teamId !== SKIP_DEBUG_TEAM_ID) {
        debugRowsToAppend.push([now, gw, teamId, '', 0, '', 0, 'ERR', '', '', '', '', '', '', 'Processing error', 'Processing error: ' + e]);
      }
    }
  }

  // Write GW outputs (single row across the configured columns)
  try {
    var s2 = ss.getSheetByName(SHEET_NAME);
    s2.getRange(GW_START_ROW + gw - 1, GAMEWEEK_OUTPUT_COL, 1, numTeams).setValues([gwOutputRow]);
    s2.getRange(GW_START_ROW + gw - 1, CAPTAIN_OUTPUT_COL, 1, numTeams).setValues([capvcOutputRow]);
    _writeMainLastUpdated();
    Logger.log('Written GW' + gw + ' outputs.');
  } catch (e) {
    Logger.log('Error writing GW outputs: ' + e);
    _writeMainLastUpdated();
  }

  // ---------- Append / replace debug rows in FPL_Debug sheet ----------
  try {
    var dbg = ss.getSheetByName(DEBUG_SHEET_NAME);
    if (!dbg) {
      dbg = ss.insertSheet(DEBUG_SHEET_NAME);
      // write header
      var debugHeader = [
        'Timestamp','Gameweek','TeamID','TeamName','TransfersMade','TransfersMadeDetail','TransferCost','PointsDeducted','FreeTransfersLeft',
        'ActiveChip','ChipEffect','SubsApplied','AutomaticSubs','BenchUsedNames','Notes','DetailedNotes'
      ];
      dbg.getRange(1,1,1,debugHeader.length).setValues([debugHeader]);
    }

    // If current GW already exists, delete existing rows for this GW (so we don't duplicate)
    var lastRow = dbg.getLastRow();
    if (lastRow >= 2) {
      var allVals = dbg.getRange(2,1,lastRow-1, dbg.getLastColumn()).getValues();
      var rowsToDelete = [];
      for (var r = 0; r < allVals.length; r++) {
        var rowGw = Number(allVals[r][1]); // Gameweek column (index 1)
        if (rowGw === gw) {
          rowsToDelete.push(r + 2); // actual sheet row index
        }
      }
      // delete from bottom to top to preserve indices
      if (rowsToDelete.length) {
        for (var d = rowsToDelete.length - 1; d >= 0; d--) {
          dbg.deleteRow(rowsToDelete[d]);
        }
      }
    }

    // Append debugRowsToAppend (if any)
    if (debugRowsToAppend.length > 0) {
      var appendStart = dbg.getLastRow() + 1;
      dbg.getRange(appendStart, 1, debugRowsToAppend.length, debugRowsToAppend[0].length).setValues(debugRowsToAppend);
    }

    dbg.setFrozenRows(1);
    dbg.getRange(1, dbg.getLastColumn() + 2).setValue('Last updated:');
    dbg.getRange(1, dbg.getLastColumn() + 3).setValue(new Date());
    Logger.log('Appended debug rows: ' + debugRowsToAppend.length);
  } catch (e) {
    Logger.log('Error writing debug sheet: ' + e);
  }
}

/* ========== Team-specific debug helpers ========== */
/**
 * Run the single-team debug for the problematic team quickly (auto-detect GW)
 */
function updateTeam6196491() {
  var gw = detectCurrentGameweekFromFPL();
  if (!gw) {
    throw new Error('Could not detect current GW.');
  }
  updateSingleTeamDebug(6196491, gw);
}

/* ========== League standings updater ========== */
function updateLeague1417390() {
  updateLeagueStandings(LEAGUE_ID);
}

function updateLeagueStandings(leagueId) {
  if (!leagueId) throw new Error('Missing leagueId');
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = LEAGUE_SHEET_PREFIX + leagueId;
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);
  else sheet.clearContents();

  var url = 'https://fantasy.premierleague.com/api/leagues-classic/' + leagueId + '/standings/';
  try {
    var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) {
      sheet.getRange(1,1).setValue('ERROR: league fetch failed code=' + resp.getResponseCode());
      _writeMainLastUpdated(); return;
    }
    var data = JSON.parse(resp.getContentText());
    var results = null;
    if (data && data.standings && Array.isArray(data.standings.results)) results = data.standings.results;
    else if (Array.isArray(data.results)) results = data.results;
    else if (Array.isArray(data.league)) results = data.league;
    else if (Array.isArray(data.entries)) results = data.entries;
    else if (Array.isArray(data.standings)) results = data.standings;

    if (!Array.isArray(results) || results.length === 0) {
      sheet.getRange(1,1).setValue('No standings results found in API response.');
      _writeMainLastUpdated(); return;
    }

    var headerSet = new Set();
    var sampleCount = Math.min(results.length, 5);
    for (var i = 0; i < sampleCount; i++) {
      var r = results[i];
      Object.keys(r).forEach(function(k){
        var v = r[k];
        if (v === null) headerSet.add(k);
        else if (typeof v === 'object') {
          if (v && typeof v.id !== 'undefined') headerSet.add(k + '.id');
          if (v && typeof v.name !== 'undefined') headerSet.add(k + '.name');
          headerSet.add(k);
        } else headerSet.add(k);
      });
    }

    var headers = Array.from(headerSet);
    var preferredOrder = ['rank','entry','entry_name','player_name','total','event_total','last_rank','favourite_team'];
    var orderedHeaders = [];
    preferredOrder.forEach(function(h){ if (headers.indexOf(h) !== -1) orderedHeaders.push(h); });
    headers.forEach(function(h){ if (orderedHeaders.indexOf(h) === -1) orderedHeaders.push(h); });

    var rows = results.map(function(r){
      return orderedHeaders.map(function(h){
        if (h.indexOf('.') > -1) {
          var parts = h.split('.');
          var parent = parts[0], child = parts[1];
          var val = r[parent];
          if (val && typeof val === 'object' && typeof val[child] !== 'undefined') return val[child];
          return '';
        } else {
          var v = r[h];
          if (v === null || typeof v === 'undefined') return '';
          if (typeof v === 'object') {
            if (typeof v.id !== 'undefined') return v.id;
            if (typeof v.name !== 'undefined') return v.name;
            try { return JSON.stringify(v); } catch (e) { return String(v); }
          }
          return v;
        }
      });
    });

    sheet.getRange(1,1,1,orderedHeaders.length).setValues([orderedHeaders]);
    sheet.getRange(2,1,rows.length,orderedHeaders.length).setValues(rows);
    sheet.setFrozenRows(1);
    sheet.getRange(1, orderedHeaders.length + 2).setValue('Last updated:');
    sheet.getRange(1, orderedHeaders.length + 3).setValue(new Date());
    _writeMainLastUpdated();
    Logger.log('League ' + leagueId + ' written with ' + results.length + ' rows.');
  } catch (e) {
    Logger.log('Error fetching/writing league standings: ' + e);
    sheet.getRange(1,1).setValue('ERROR: ' + e);
    _writeMainLastUpdated();
  }
}

/* ========== Trigger helpers ========== */
function createAutoUpdateTriggers() {
  var funcs = ['updateFPLCurrentGWPoints','updateLeague1417390'];
  var existing = ScriptApp.getProjectTriggers();
  funcs.forEach(function(fn){
    var exists = existing.some(function(t){ return t.getHandlerFunction() === fn; });
    if (exists) Logger.log("Trigger for '" + fn + "' already exists — skipping creation.");
    else {
      ScriptApp.newTrigger(fn).timeBased().everyMinutes(30).create();
      Logger.log("Created time-driven trigger for '" + fn + "' (every 30 minutes).");
    }
  });
}

function listAutoUpdateTriggers() {
  var ts = ScriptApp.getProjectTriggers();
  if (!ts || ts.length === 0) { Logger.log('No triggers found for this project.'); return; }
  ts.forEach(function(t,i){ Logger.log((i+1) + '. Function: ' + t.getHandlerFunction() + ', Type: ' + t.getEventType()); });
}

function deleteAutoUpdateTriggers() {
  var funcs = ['updateFPLCurrentGWPoints','updateLeague1417390'];
  var existing = ScriptApp.getProjectTriggers();
  var removed = 0;
  existing.forEach(function(t){
    if (funcs.indexOf(t.getHandlerFunction()) !== -1) {
      ScriptApp.deleteTrigger(t);
      removed++;
      Logger.log("Deleted trigger for '" + t.getHandlerFunction() + "'");
    }
  });
  if (removed === 0) Logger.log('No matching triggers found to delete.');
}

/* ========== Helpers ========== */
function _writeMainLastUpdated() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var main = ss.getSheetByName(SHEET_NAME);
    if (main) main.getRange(TIMESTAMP_CELL).setValue(new Date());
  } catch (e) {
    Logger.log('Failed to write main last-updated timestamp: ' + e);
  }
}

/**
 * Convert transfers list to a readable string using idToName when available.
 * transfersList: array of transfer objects { element_out, element_in, cost }
 * idToName: mapping of player id -> display name (optional)
 */
function transfersListToString(transfersList, idToName) {
  if (!Array.isArray(transfersList) || !transfersList.length) return '';
  var parts = [];
  for (var i = 0; i < transfersList.length; i++) {
    var t = transfersList[i];
    var outName = (idToName && t.element_out) ? (idToName[t.element_out] || ('#' + t.element_out)) : (t.element_out ? ('#' + t.element_out) : '');
    var inName  = (idToName && t.element_in)  ? (idToName[t.element_in]  || ('#' + t.element_in))  : (t.element_in ? ('#' + t.element_in) : '');
    parts.push((outName || '') + ' → ' + (inName || '') + (t.cost ? (' (' + t.cost + ')') : ''));
  }
  return parts.join('; ');
}

/**
 * Clear GW rows on the main sheet for a range of gameweeks.
 * This removes previously written totals so the subsequent write will be fresh.
 * startGw, endGw: inclusive GW indices
 */
function clearGWRowsOnSheet(startGw, endGw) {
  startGw = Number(startGw) || 1;
  endGw = Number(endGw) || startGw;
  endGw = Math.min(endGw, MAX_GAMEWEEKS);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) throw new Error('Sheet not found: ' + SHEET_NAME);
  var numTeams = sh.getRange(TEAM_ID_RANGE).getValues()[0].length;
  for (var gw = startGw; gw <= endGw; gw++) {
    // clear both total points row (GAMEWEEK_OUTPUT_COL) and captain/vc row (CAPTAIN_OUTPUT_COL)
    sh.getRange(GW_START_ROW + gw - 1, GAMEWEEK_OUTPUT_COL, 1, numTeams).clearContent();
    sh.getRange(GW_START_ROW + gw - 1, CAPTAIN_OUTPUT_COL, 1, numTeams).clearContent();
  }
  SpreadsheetApp.flush();
  Logger.log('Cleared GW rows ' + startGw + ' .. ' + endGw);
}

/**
 * Update a contiguous range of gameweeks (overwrite existing values).
 * Usage:
 *   updateRangeOfGWs(1, 14);         // fill GW1..GW14
 *   updateRangeOfGWs(5);             // fill GW1..GW5 (because endGw param omitted -> endGw = startGw)
 *   updateRangeOfGWs(5, 9, 1500);    // fill GW5..GW9 with 1.5s pause between requests
 * This calls updateFPLForGW(gw) for each GW and waits delayMs between calls.
 */
function updateRangeOfGWs(startGw, endGw, delayMs) {
  startGw = Number(startGw) || 1;
  endGw = (typeof endGw === 'undefined' || endGw === null) ? startGw : Number(endGw);
  delayMs = (typeof delayMs === 'undefined' || delayMs === null) ? 1200 : Number(delayMs);
  if (startGw < 1) startGw = 1;
  if (endGw > MAX_GAMEWEEKS) endGw = MAX_GAMEWEEKS;
  if (endGw < startGw) throw new Error('endGw must be >= startGw');

  // recommended: clear previous values for this range (so partial leftovers are removed)
  clearGWRowsOnSheet(startGw, endGw);

  Logger.log('Beginning updateRangeOfGWs: ' + startGw + ' -> ' + endGw + ' (delay ' + delayMs + 'ms)');

  for (var gw = startGw; gw <= endGw; gw++) {
    try {
      Logger.log('Updating GW ' + gw + ' ...');
      updateFPLForGW(gw);         // existing function in your script which writes GW row
      // small sleep between requests to avoid being throttled by FPL
      Utilities.sleep(delayMs);
    } catch (e) {
      Logger.log('Error updating GW ' + gw + ': ' + e);
      // continue — don't abort the whole run
    }
  }

  Logger.log('Finished updateRangeOfGWs: ' + startGw + ' -> ' + endGw);
  // refresh last-updated timestamp
  try { _writeMainLastUpdated(); } catch (e) { Logger.log('_writeMainLastUpdated failed: ' + e); }
}

/**
 * From GW1 → current:
 *  1) write raw GW totals (your existing flow)
 *  2) subtract OfficialTransferCostPoints from Hits_Tracker (cost-only)
 */
function updateAllGWsUpToCurrent() {
  var cur = detectCurrentGameweekFromFPL();
  if (!cur) throw new Error('Could not detect current gameweek');
  // 1) write fresh/raw GW totals (overwrites any previous adjustments)
  updateRangeOfGWs(1, cur, 1200);
  // 2) subtract only OfficialTransferCostPoints (no other columns used)
  applyHitDeductions_COST_ONLY(1, cur);
  Logger.log('Done: GW1..' + cur + ' updated and hit costs applied (cost-only).');
}

/**
 * Subtract OfficialTransferCostPoints from Sheet1 left GW grid for GW range.
 * Uses TEAM_ID_RANGE order; only touches the left table starting at:
 *   row = GW_START_ROW, col = GAMEWEEK_OUTPUT_COL, width = #teams
 * Assumes step (1) above just wrote raw values → idempotent within this flow.
 */
function applyHitDeductions_COST_ONLY(startGw, endGw) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  var tracker = ss.getSheetByName('Hits_Tracker');
  if (!sheet) throw new Error('Sheet not found: ' + SHEET_NAME);
  if (!tracker) { Logger.log('Hits_Tracker not found; skipping.'); return; }

  // team ids in display order
  var teamIds = sheet.getRange(TEAM_ID_RANGE).getValues()[0]
    .map(function(v){ return (v === '' || v === null) ? null : (isNaN(v) ? String(v) : String(Number(v))); })
    .filter(function(x){ return x !== null; });

  var numTeams = teamIds.length;
  if (!numTeams) throw new Error('No team IDs found in TEAM_ID_RANGE');

  // Hits_Tracker columns
  var hh = tracker.getRange(1,1,1,tracker.getLastColumn()).getValues()[0];
  var cGW   = hh.indexOf('Gameweek');
  var cTID  = hh.indexOf('TeamID');
  var cCOST = hh.indexOf('OfficialTransferCostPoints');

  if (cGW === -1 || cTID === -1 || cCOST === -1)
    throw new Error('Hits_Tracker must have Gameweek, TeamID, OfficialTransferCostPoints');

  // build cost map: cost[gw][tid] = points
  var data = tracker.getRange(2,1,Math.max(0,tracker.getLastRow()-1), tracker.getLastColumn()).getValues();
  var cost = {};
  for (var i=0;i<data.length;i++){
    var gw  = Number(data[i][cGW]);
    var tid = String(data[i][cTID]);
    var v   = Number(data[i][cCOST]) || 0;
    if (!gw || !tid) continue;
    if (!cost[gw]) cost[gw] = {};
    cost[gw][tid] = v;
  }

  // read the left GW grid slice we need and subtract costs
  var startRow = GW_START_ROW + (startGw - 1);
  var startCol = GAMEWEEK_OUTPUT_COL;
  var numRows  = endGw - startGw + 1;
  var grid = sheet.getRange(startRow, startCol, numRows, numTeams).getValues();

  for (var gw = startGw; gw <= endGw; gw++) {
    var rowIdx = gw - startGw;
    var cRow = cost[gw] || {};
    for (var t = 0; t < numTeams; t++) {
      var tid = String(teamIds[t]);
      var hit = Number(cRow[tid] || 0);
      var cur = grid[rowIdx][t];
      if (cur !== '' && cur !== null && !isNaN(cur)) {
        grid[rowIdx][t] = Number(cur) - hit;   // cost-only deduction
      }
    }
  }

  sheet.getRange(startRow, startCol, numRows, numTeams).setValues(grid);
  // stamp (optional)
  try { if (typeof TIMESTAMP_CELL !== 'undefined' && TIMESTAMP_CELL) sheet.getRange(TIMESTAMP_CELL).setValue(new Date()); } catch(e){}
}

/** 
 * Create a weekly trigger that runs updateAll every Sunday at 22:00 IST.
 * Timezone-agnostic: computes project timezone offset and schedules the correct local hour.
 */
function createWeeklyUpdateAllTriggerIST() {
  // remove existing updateAll weekly triggers to avoid duplicates
  deleteWeeklyUpdateAllTriggers();
  try {
    var ss = SpreadsheetApp.getActive();
    var projectTz = ss.getSpreadsheetTimeZone(); // e.g. "Asia/Kolkata"
    var istTz = 'Asia/Kolkata';
    var now = new Date();
    function tzOffsetMinutes(tz) {
      // returns offset in minutes (signed) for current date in given tz, e.g. +330
      var z = Utilities.formatDate(now, tz, "Z"); // format like "+0530" or "-0400"
      var sign = z.charAt(0) === '-' ? -1 : 1;
      var hh = Number(z.substr(1,2));
      var mm = Number(z.substr(3,2));
      return sign * (hh * 60 + mm);
    }
    var projOffset = tzOffsetMinutes(projectTz);
    var istOffset  = tzOffsetMinutes(istTz);
    // projOffset - istOffset = minutes project is ahead of IST (could be negative)
    var diffMinutes = projOffset - istOffset;
    // convert to integer hours (rounded toward zero)
    var diffHours = Math.round(diffMinutes / 60);
    // desired hour in project timezone that corresponds to 22:00 IST
    var desiredHour = (22 - diffHours) % 24;
    if (desiredHour < 0) desiredHour += 24;
    ScriptApp.newTrigger('updateAll')
      .timeBased()
      .onWeekDay(ScriptApp.WeekDay.SUNDAY)
      .atHour(desiredHour)
      .create();
    Logger.log('Created weekly trigger: updateAll every Sunday at ' + desiredHour + ':00 (project tz: ' + projectTz + ') == 22:00 IST');
  } catch (e) {
    Logger.log('createWeeklyUpdateAllTriggerIST failed: ' + e);
    throw e;
  }
}

/**
 * Simpler creation that assumes project timezone is set to Asia/Kolkata.
 * Use only if you've set the project timezone to Asia/Kolkata in Project Settings.
 */
function createWeeklyUpdateAllTriggerSimple() {
  deleteWeeklyUpdateAllTriggers();
  ScriptApp.newTrigger('updateAll')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(22) // 22:00 in project's timezone
    .create();
  Logger.log('Created weekly trigger (simple): updateAll every Sunday at 22:00 (project timezone).');
}

/**
 * Delete any triggers that invoke updateAll (safe to call before creating)
 */
function deleteWeeklyUpdateAllTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  var removed = 0;
  for (var i = 0; i < triggers.length; i++) {
    var t = triggers[i];
    try {
      if (t.getHandlerFunction && t.getHandlerFunction() === 'updateAll') {
        ScriptApp.deleteTrigger(t);
        removed++;
      }
    } catch (e) {
      // continue
    }
  }
  Logger.log('deleteWeeklyUpdateAllTriggers removed ' + removed + ' trigger(s) for updateAll.');
}

/**
 * Convenience: run updateAll now for testing
 */
function runUpdateAllNow() {
  try {
    updateAll();
    Logger.log('updateAll executed via runUpdateAllNow()');
  } catch (e) {
    Logger.log('runUpdateAllNow failed: ' + e);
    throw e;
  }
}

/******************************************************
 * One-shot updater (correct "without hits" totals)
 * - Uses /api/entry/{id}/history/ (reliable)
 * - Writes both AFTER and BEFORE hits metrics:
 *   • OfficialGWPointsAfterHits
 *   • OfficialTransferCostPoints
 *   • OfficialGWPointsBeforeHits        = after + cost
 *   • OfficialTotalPointsAfterGW        (official)
 *   • OfficialTotalPointsBeforeGW       (cumulative of before-hits GW points)
 *   • OfficialGWPointsByDiffAfter       (diff of total_after)
 *   • OfficialGWPointsByDiffBefore     (diff of total_before)
 * - Builds two pivots:
 *   • GW_AfterHits_Pivot   (Gameweek | Team… ; after-hits GW points)
 *   • GW_BeforeHits_Pivot  (Gameweek | Team… ; before-hits GW points)
 ******************************************************/
function updateHitsTrackerAndPivot() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var main = ss.getSheetByName(typeof SHEET_NAME !== 'undefined' ? SHEET_NAME : 'Sheet1');
  if (!main) throw new Error('Sheet not found: ' + SHEET_NAME);

  // teams in your configured order
  var teamIds = main.getRange(typeof TEAM_ID_RANGE !== 'undefined' ? TEAM_ID_RANGE : 'B3:H3')
    .getValues()[0]
    .map(function(v){ return (v === '' || v === null) ? null : (isNaN(v) ? String(v) : String(Number(v))); })
    .filter(function(x){ return x !== null; });

  if (typeof SKIP_DEBUG_TEAM_ID !== 'undefined' && SKIP_DEBUG_TEAM_ID) {
    teamIds = teamIds.filter(function(t){ return String(t) !== String(SKIP_DEBUG_TEAM_ID); });
  }

  if (!teamIds.length) throw new Error('No team IDs found in TEAM_ID_RANGE');

  // ensure Hits_Tracker sheet + headers
  var hits = ss.getSheetByName('Hits_Tracker');
  if (!hits) hits = ss.insertSheet('Hits_Tracker'); else hits.clear();

  var header = [
    'Gameweek','TeamID','TeamName',
    'OfficialGWPointsAfterHits',
    'OfficialTransferCostPoints',
    'OfficialGWPointsBeforeHits',
    'OfficialTotalPointsAfterGW',
    'OfficialTotalPointsBeforeGW',
    'OfficialGWPointsByDiffAfter',
    'OfficialGWPointsByDiffBefore'
  ];

  hits.getRange(1,1,1,header.length).setValues([header]);
  hits.setFrozenRows(1);

  function getTeamName(tid){
    try {
      var r = UrlFetchApp.fetch('https://fantasy.premierleague.com/api/entry/' + tid + '/', {muteHttpExceptions:true});
      if (r.getResponseCode() !== 200) return 'Team#' + tid;
      var e = JSON.parse(r.getContentText());
      return e.player_name || e.entry_name || e.name || ('Team#' + tid);
    } catch(_) { return 'Team#' + tid; }
  }

  var idToName = {};
  var rows = [];
  var gwSet = {};
  var tidOrder = {};
  for (var t = 0; t < teamIds.length; t++) tidOrder[String(teamIds[t])] = t;

  // Pull history for each team and compute before/after correctly
  for (var i = 0; i < teamIds.length; i++) {
    var tid = String(teamIds[i]);
    idToName[tid] = getTeamName(tid);
    var url = 'https://fantasy.premierleague.com/api/entry/' + tid + '/history/';
    var resp, obj, current;
    try {
      resp = UrlFetchApp.fetch(url, {muteHttpExceptions:true});
      if (resp.getResponseCode() !== 200) {
        Logger.log('history fetch failed for ' + tid + ' code=' + resp.getResponseCode());
        continue;
      }
      obj = JSON.parse(resp.getContentText());
      current = Array.isArray(obj.current) ? obj.current : [];
    } catch (e) {
      Logger.log('history parse error for ' + tid + ': ' + e);
      continue;
    }

    var prevTotalAfter = null;
    var prevTotalBefore = null;
    var runningTotalBefore = 0; // we'll build BEFORE-hits cumulative by summing GW-before points

    for (var k = 0; k < current.length; k++) {
      var ev = current[k];
      var gw = Number(ev.event);
      if (!gw) continue;

      var gwAfter = (typeof ev.points === 'number') ? ev.points : 0;                 // after hits (official)
      var cost    = (typeof ev.event_transfers_cost === 'number') ? ev.event_transfers_cost : 0; // 0 on WC/FH
      var gwBefore = gwAfter + cost;                                                 // add back hits
      var totalAfter = (typeof ev.total_points === 'number') ? ev.total_points : null;
      runningTotalBefore += gwBefore;
      var totalBefore = runningTotalBefore; // constructed cumulative w/o hits

      var diffAfter = (prevTotalAfter === null || totalAfter === null) ? gwAfter : (totalAfter - prevTotalAfter);
      var diffBefore = (prevTotalBefore === null) ? gwBefore : (totalBefore - prevTotalBefore);

      prevTotalAfter = (totalAfter === null) ? prevTotalAfter : totalAfter;
      prevTotalBefore = totalBefore;

      rows.push([
        gw, tid, idToName[tid],
        gwAfter,                       // OfficialGWPointsAfterHits
        cost,                          // OfficialTransferCostPoints
        gwBefore,                      // OfficialGWPointsBeforeHits
        totalAfter,                    // OfficialTotalPointsAfterGW
        totalBefore,                   // OfficialTotalPointsBeforeGW
        diffAfter,                     // OfficialGWPointsByDiffAfter
        diffBefore                     // OfficialGWPointsByDiffBefore
      ]);

      gwSet[gw] = true;
    }
  }

  // sort rows: by GW, then by team order
  rows.sort(function(a,b){
    if (a[0] !== b[0]) return a[0] - b[0];
    return (tidOrder[a[1]] || 0) - (tidOrder[b[1]] || 0);
  });

  if (rows.length) hits.getRange(2,1,rows.length,header.length).setValues(rows);

  hits.getRange(1, header.length + 2).setValue('Last updated (official history):');
  hits.getRange(1, header.length + 3).setValue(new Date());

  // ---- Build Pivots ----
  buildPivot_(ss, hits, teamIds, idToName, 'OfficialGWPointsAfterHits', 'GW_AfterHits_Pivot');
  buildPivot_(ss, hits, teamIds, idToName, 'OfficialGWPointsBeforeHits', 'GW_BeforeHits_Pivot');

  Logger.log('Hits_Tracker + pivots updated (after & before hits).');
}

/**
 * Build a pivot: Gameweek | Team1 | Team2 | ... (value = columnName)
 */
function buildPivot_(ss, hitsSheet, teamIds, idToName, columnName, pivotName) {
  var header = hitsSheet.getRange(1,1,1,hitsSheet.getLastColumn()).getValues()[0];
  var idxGW = header.indexOf('Gameweek');
  var idxTID = header.indexOf('TeamID');
  var idxVal = header.indexOf(columnName);
  if (idxGW === -1 || idxTID === -1 || idxVal === -1) throw new Error('Missing columns for pivot: ' + columnName);

  var data = hitsSheet.getRange(2,1,Math.max(0, hitsSheet.getLastRow()-1), hitsSheet.getLastColumn()).getValues();

  // collect gw list and map gw -> tid -> val
  var gwSet = {};
  var map = {};
  for (var r = 0; r < data.length; r++) {
    var gw = Number(data[r][idxGW]);
    var tid = String(data[r][idxTID]);
    var v = data[r][idxVal];
    if (!gw) continue;
    gwSet[gw] = true;
    if (!map[gw]) map[gw] = {};
    map[gw][tid] = (v === '' || v === null) ? '' : Number(v);
  }

  var gws = Object.keys(gwSet).map(function(x){ return Number(x); }).sort(function(a,b){ return a-b; });

  // create/overwrite pivot sheet
  var pivot = ss.getSheetByName(pivotName);
  if (pivot) ss.deleteSheet(pivot);
  pivot = ss.insertSheet(pivotName);

  var teamHeaders = teamIds.map(function(tid){ return idToName[String(tid)]; });
  var headerRow = ['Gameweek'].concat(teamHeaders);
  pivot.getRange(1,1,1,headerRow.length).setValues([headerRow]);
  pivot.setFrozenRows(1);

  var out = [];
  for (var i = 0; i < gws.length; i++) {
    var gw = gws[i];
    var row = [gw];
    for (var j = 0; j < teamIds.length; j++) {
      var tid = String(teamIds[j]);
      row.push(map[gw] && typeof map[gw][tid] !== 'undefined' ? map[gw][tid] : '');
    }
    out.push(row);
  }

  if (out.length) pivot.getRange(2,1,out.length,headerRow.length).setValues(out);

  pivot.getRange(1, headerRow.length + 2).setValue('Last built (' + columnName + '):');
  pivot.getRange(1, headerRow.length + 3).setValue(new Date());
}

/******************************************************
 * Idempotent updater for Sheet1 GW totals
 * - Replaces the left GW table (B.., starting at GW_START_ROW)
 *   with the official AFTER-HITS points for each team & GW.
 * - Uses /api/entry/{id}/history/ (reliable; includes hits).
 * - Does NOT touch the Captaincy Points block on the right.
 ******************************************************/
function applyOfficialAfterHitsToSheet1() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Sheet not found: ' + SHEET_NAME);

  // Read team IDs in display order
  var teamIds = sheet.getRange(TEAM_ID_RANGE).getValues()[0]
    .map(function(v){ return (v === '' || v === null) ? null : (isNaN(v) ? String(v) : String(Number(v))); })
    .filter(function(x){ return x !== null; });

  if (!teamIds.length) throw new Error('No team IDs found in ' + TEAM_ID_RANGE);

  // Build map: after[gw][teamId] = official GW points (already after hits)
  var after = {};   // gw -> { tid -> points }
  var maxGw = 0;

  for (var i = 0; i < teamIds.length; i++) {
    var tid = String(teamIds[i]);
    try {
      var url = 'https://fantasy.premierleague.com/api/entry/' + tid + '/history/';
      var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      if (resp.getResponseCode() !== 200) {
        Logger.log('history fetch failed for ' + tid + ' code=' + resp.getResponseCode());
        continue;
      }
      var current = (JSON.parse(resp.getContentText()).current) || [];
      for (var k = 0; k < current.length; k++) {
        var gw = Number(current[k].event);
        var pts = (typeof current[k].points === 'number') ? current[k].points : null; // AFTER hits
        if (!gw || pts === null) continue;
        if (!after[gw]) after[gw] = {};
        after[gw][tid] = pts;
        if (gw > maxGw) maxGw = gw;
      }
    } catch (e) {
      Logger.log('history parse error for ' + tid + ': ' + e);
    }
  }

  if (maxGw === 0) { Logger.log('No finished GWs found; nothing to write.'); return; }

  // Read existing GW block
  var startRow = GW_START_ROW;            // e.g., 5
  var startCol = GAMEWEEK_OUTPUT_COL;     // e.g., 2 (col B)
  var numTeams = teamIds.length;
  var numRows  = Math.min(MAX_GAMEWEEKS || 38, maxGw);

  var grid = sheet.getRange(startRow, startCol, numRows, numTeams).getValues();

  // Overwrite with official AFTER-HITS points (idempotent)
  for (var gw = 1; gw <= numRows; gw++) {
    var rowIdx = gw - 1;
    var rowMap = after[gw] || {};
    for (var t = 0; t < numTeams; t++) {
      var tid = String(teamIds[t]);
      if (typeof rowMap[tid] === 'number') {
        grid[rowIdx][t] = rowMap[tid];  // absolute write; no double-deducts
      }
      // else leave existing value as-is (e.g., future/unplayed GW)
    }
  }

  sheet.getRange(startRow, startCol, numRows, numTeams).setValues(grid);

  // Timestamp
  try {
    if (typeof TIMESTAMP_CELL !== 'undefined' && TIMESTAMP_CELL) {
      sheet.getRange(TIMESTAMP_CELL).setValue(new Date());
    }
  } catch(_) {}

  Logger.log('Sheet1 GW totals overwritten with official after-hits points for GW1..' + numRows);
}

/**
 * Build/refresh "Summary" excluding SKIP_DEBUG_TEAM_ID (default 9388548):
 * Columns: User Name | GW Wins | 2nd Finishes | Last Finishes | Captaincy Wins | Leaderboard position
 */
function buildSummarySheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var main = ss.getSheetByName(SHEET_NAME);
  if (!main) throw new Error('Sheet not found: ' + SHEET_NAME);

  var skipId = (typeof SKIP_DEBUG_TEAM_ID !== 'undefined' && SKIP_DEBUG_TEAM_ID) ? String(SKIP_DEBUG_TEAM_ID) : '9388548';

  // Team IDs in display order (from TEAM_ID_RANGE), then exclude skipId
  var allTeamIds = main.getRange(TEAM_ID_RANGE).getValues()[0]
    .map(function(v){ return (v === '' || v === null) ? null : (isNaN(v) ? String(v) : String(Number(v))); })
    .filter(function(x){ return x !== null; });

  // Indices to keep (exclude skipId)
  var keepIdx = [];
  for (var i = 0; i < allTeamIds.length; i++) {
    if (String(allTeamIds[i]) !== String(skipId)) keepIdx.push(i);
  }

  if (!keepIdx.length) throw new Error('No teams left after excluding ' + skipId);

  // Helper to project row by kept indices
  function projectRow(row) { return keepIdx.map(function(k){ return row[k]; }); }
  function projectGrid(grid) { return grid.map(projectRow); }

  // How many GWs to read
  var curGw = detectCurrentGameweekFromFPL();
  if (!curGw) curGw = MAX_GAMEWEEKS;
  var rowsToRead = Math.min(curGw, MAX_GAMEWEEKS);

  var gwStartRow    = GW_START_ROW;
  var leftStartCol  = GAMEWEEK_OUTPUT_COL;
  var rightStartCol = CAPTAIN_OUTPUT_COL;

  // Read left GW table & right Captaincy table, then project columns to exclude skipId
  var leftGridAll = main.getRange(gwStartRow, leftStartCol, rowsToRead, allTeamIds.length).getValues();
  var capGridAll  = main.getRange(gwStartRow, rightStartCol, rowsToRead, allTeamIds.length).getValues();

  var leftGrid = projectGrid(leftGridAll);
  var capGrid  = projectGrid(capGridAll);

  var teamIds = keepIdx.map(function(k){ return String(allTeamIds[k]); });
  var numTeams = teamIds.length;

  // Counters
  var gwWins = new Array(numTeams).fill(0);
  var secondFinishes = new Array(numTeams).fill(0);
  var lastFinishes = new Array(numTeams).fill(0);
  var capWins = new Array(numTeams).fill(0);

  function numericRow(row){
    return row.map(function(v){ return (v === '' || v === null || isNaN(v)) ? null : Number(v); });
  }

  for (var r = 0; r < rowsToRead; r++) {
    // GW positions
    var vals = numericRow(leftGrid[r]);
    var valid = vals.filter(function(v){ return v !== null; });
    if (valid.length > 0) {
      var maxVal = Math.max.apply(null, valid);
      var minVal = Math.min.apply(null, valid);

      // wins (ties)
      for (var c = 0; c < numTeams; c++) if (vals[c] !== null && vals[c] === maxVal) gwWins[c]++;

      // second (highest strictly < max)
      var secondVal = null;
      for (var i2 = 0; i2 < valid.length; i2++) {
        var v = valid[i2];
        if (v < maxVal && (secondVal === null || v > secondVal)) secondVal = v;
      }
      if (secondVal !== null) {
        for (var c2 = 0; c2 < numTeams; c2++) if (vals[c2] !== null && vals[c2] === secondVal) secondFinishes[c2]++;
      }

      // last (ties)
      for (var c3 = 0; c3 < numTeams; c3++) if (vals[c3] !== null && vals[c3] === minVal) lastFinishes[c3]++;
    }

    // Captaincy wins (ties)
    var caps = numericRow(capGrid[r]);
    var capsValid = caps.filter(function(v){ return v !== null; });
    if (capsValid.length > 0) {
      var maxCap = Math.max.apply(null, capsValid);
      for (var cc = 0; cc < numTeams; cc++) if (caps[cc] !== null && caps[cc] === maxCap) capWins[cc]++;
    }
  }

  // Leaderboard: totals row B43:G43 aligned to kept columns
  var totalsRowIndex = gwStartRow + MAX_GAMEWEEKS - 1;
  var totalsAll = main.getRange(totalsRowIndex + 1, leftStartCol, 1, allTeamIds.length).getValues()[0];
  var totals = projectRow(totalsAll).map(function(v){ return (v === '' || v === null || isNaN(v)) ? 0 : Number(v); });

  // Rank (standard competition: 1,1,3…)
  var sortedUnique = Array.from(new Set(totals.slice().sort(function(a,b){ return b-a; })));
  var rankMap = {};
  for (var k = 0; k < sortedUnique.length; k++) rankMap[sortedUnique[k]] = k + 1;

  var leaderboardPos = totals.map(function(total){ return rankMap[total]; });

  // Names for kept teams
  var userNames = new Array(numTeams);
  for (var t = 0; t < numTeams; t++) {
    var tid = teamIds[t];
    try {
      var url = 'https://fantasy.premierleague.com/api/entry/' + tid + '/';
      var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      if (resp.getResponseCode() === 200) {
        var ed = JSON.parse(resp.getContentText());
        userNames[t] = ed.player_name || ed.entry_name || ed.name || ('Team#' + tid);
      } else {
        userNames[t] = 'Team#' + tid;
      }
    } catch(e){ userNames[t] = 'Team#' + tid; }
  }

  // Write Summary
  var outName = 'Summary';
  var out = ss.getSheetByName(outName);
  if (out) ss.deleteSheet(out);
  out = ss.insertSheet(outName);

  var header = ['User Name','GW Wins','2nd Finishes','Last Finishes','Captaincy Wins','Leaderboard position'];
  out.getRange(1,1,1,header.length).setValues([header]);

  var rows = [];
  for (var j = 0; j < numTeams; j++) {
    rows.push([userNames[j], gwWins[j], secondFinishes[j], lastFinishes[j], capWins[j], leaderboardPos[j]]);
  }

  if (rows.length) out.getRange(2,1,rows.length,header.length).setValues(rows);

  out.setFrozenRows(1);
  out.autoResizeColumns(1, header.length);
  out.getRange(1, header.length + 2).setValue('Last updated:');
  out.getRange(1, header.length + 3).setValue(new Date());

  Logger.log('Summary sheet written (excluded team ' + skipId + ').');
}

