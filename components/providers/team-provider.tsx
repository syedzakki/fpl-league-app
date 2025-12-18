"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface TeamContextType {
    selectedTeamId: string | null
    setSelectedTeamId: (id: string | null) => void
    teamName: string | null
    setTeamName: (name: string | null) => void
    isLoading: boolean
    setIsLoading: (loading: boolean) => void
    setTeam: (id: string, name: string) => void
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

export function TeamProvider({ children }: { children: ReactNode }) {
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
    const [teamName, setTeamName] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    console.log("TeamProvider Render:", { selectedTeamId, teamName, isLoading })

    useEffect(() => {
        console.log("TeamProvider Mount")
        // Load from local storage on mount
        const storedTeamId = localStorage.getItem("fpl_selected_team_id")
        const storedTeamName = localStorage.getItem("fpl_selected_team_name")
        console.log("TeamProvider Storage:", { storedTeamId, storedTeamName })

        if (storedTeamId) setSelectedTeamId(storedTeamId)
        if (storedTeamName) setTeamName(storedTeamName)
        setIsLoading(false)
    }, [])

    // Simplistic handlers for individual setbacks - keeping these for backward compat but relying on setTeam for login
    const setTeamIdOnly = (id: string | null) => {
        setSelectedTeamId(id)
        if (id) localStorage.setItem("fpl_selected_team_id", id)
        else localStorage.removeItem("fpl_selected_team_id")
    }

    const setTeamNameOnly = (name: string | null) => {
        setTeamName(name)
        if (name) localStorage.setItem("fpl_selected_team_name", name)
        else localStorage.removeItem("fpl_selected_team_name")
    }

    const handleSetTeam = (id: string, name: string) => {
        console.log("Atomic setTeam called:", { id, name })
        setSelectedTeamId(id)
        setTeamName(name)
        localStorage.setItem("fpl_selected_team_id", id)
        localStorage.setItem("fpl_selected_team_name", name)
    }

    return (
        <TeamContext.Provider
            value={{
                selectedTeamId,
                setSelectedTeamId: setTeamIdOnly,
                teamName,
                setTeamName: setTeamNameOnly,
                isLoading,
                setIsLoading,
                setTeam: handleSetTeam
            }}
        >
            {children}
        </TeamContext.Provider>
    )
}

export function useTeam() {
    const context = useContext(TeamContext)
    if (context === undefined) {
        throw new Error("useTeam must be used within a TeamProvider")
    }
    return context
}
