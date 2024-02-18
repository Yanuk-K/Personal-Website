import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Header from '/components/Header'

function App() {

  return (
    <>
      <Header></Header>
      <h1>Yeunwook Kim</h1>
      <h3>Software Engineer</h3>
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
    </>
  )
}

export default App
