import React from 'react'

function Header() {
    const menu = [
        {
            id: 1,
            name: "HOME"
        },
        {
            id: 2,
            name: "PROJECTS"
        },
        {
            id: 3,
            name: "RESUME"
        },
        {
            id: 4,
            name: "INTERESTS"
        },
        {
            id: 5,
            name: "CONTACTS"
        }
    ]
    return (
        <div className='flex items-center w-screen border-b-[1px] justify-evenly'>
            {menu.map((item)=>(
                <div className='cursor-pointer
                hover:underline font-medium'>
                    <a href={'/'+item.name.toLowerCase()+'/'}><h2>{item.name}</h2></a>
                </div>
            ))}
        </div>
    )      
}

export default Header