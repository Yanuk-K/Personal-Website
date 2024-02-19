import React from 'react'

function Header() {
    const menu = [
        {
            id: 1,
            name: "HOME"
        },
        {
            id: 2,
            name: "SKILLS"
        },
        {
            id: 3,
            name: "PROJECTS"
        },
        {
            id: 4,
            name: "RESUME"
        },
        {
            id: 5,
            name: "INTERESTS"
        },
        {
            id: 6,
            name: "CONTACTS"
        }
    ]
    return (
        <div className='flex gap-14'>
            {menu.map((item)=>(
                <div className='cursor-pointer
                hover:underline font-medium'>
                    <h2>{item.name}</h2>
                </div>
            ))}
        </div>
    )      
}

export default Header