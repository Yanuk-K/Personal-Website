import reactLogo from '../assets/react.svg'
import viteLogo from '../../public/vite.svg'
import React from 'react'

function Main() {
  return (
    <div className='items-center'>
        <div>
            <h1>Yeunwook Kim</h1>
        </div>
        <div>
        <h3>Hi👋 I’m Yeunwook Kim, a senior at UCSD majoring in Mathematics-Computer Science based in Seoul, South Korea.</h3>
        </div>
        <p className="framework-info">Frameworks used to make this website:
            <div>
            <a href="https://vitejs.dev" target="_blank">
                <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank">
                <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
            </div>
        </p>
      </div>
  )
}

export default Main