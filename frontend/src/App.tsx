import { Routes, Route, NavLink, Link } from 'react-router-dom'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Analyze from './pages/Analyze'
import Result from './pages/Result'
import History from './pages/History'
import Profile from './pages/Profile'
import About from './pages/About'

const linkStyle = ({ isActive }: { isActive: boolean }) =>
  isActive ? { background: '#2563eb', color: 'white' } : {}

export default function App() {
  return (
    <>
      <nav className="navbar">
        <div className="container">
          <Link to="/" className="logo">🏥 ngernngern_thongthong</Link>
          <nav>
            <NavLink to="/" style={linkStyle} end>Home</NavLink>
            <NavLink to="/upload" style={linkStyle}>Upload</NavLink>
            <NavLink to="/analyze" style={linkStyle}>Analyze</NavLink>
            <NavLink to="/history" style={linkStyle}>History</NavLink>
            <NavLink to="/profile" style={linkStyle}>Profile</NavLink>
            <NavLink to="/about" style={linkStyle}>About</NavLink>
          </nav>
        </div>
      </nav>
      <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '2rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/result/:id" element={<Result />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </>
  )
}
