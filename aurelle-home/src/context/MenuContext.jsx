import { createContext, useContext, useEffect, useState } from 'react'
import { getMenu } from '../lib/api.js'
import { rooms as defaultRooms, plainLinks as defaultPlainLinks } from '../data/menu.js'

const MenuContext = createContext({
    rooms: defaultRooms,
    plainLinks: defaultPlainLinks,
})

export function MenuProvider({ children }) {
    const [menu, setMenu] = useState({
        rooms: defaultRooms,
        plainLinks: defaultPlainLinks,
    })

    useEffect(() => {
        let ignoreResult = false

        getMenu()
            .then((data) => {
                if (!ignoreResult && Array.isArray(data.rooms)) {
                    setMenu({
                        rooms: data.rooms,
                        plainLinks: Array.isArray(data.plainLinks)
                            ? data.plainLinks
                            : defaultPlainLinks,
                    })
                }
            })
            .catch((error) => {
                console.error('Could not load menu:', error)
            })

        return () => {
            ignoreResult = true
        }
    }, [])

    return (
        <MenuContext.Provider value={menu}>
            {children}
        </MenuContext.Provider>
    )
}

export function useMenu() {
    return useContext(MenuContext)
}