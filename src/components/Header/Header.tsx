import React from 'react'
import './Header.sass'
import { Link, NavLink } from 'react-router-dom'
import { YinYang } from 'react-bootstrap-icons'
import ControlPanel from '../ControlPanel/ControlPanel'
import logo from '../../assets/logo.png'

const Header = () => {
	const setActive = ({ isActive }: any) => (isActive ? "tab active-tab" : "tab")
	return (
		<div className='header'>
			<div className='header-global'>
				<div className='header-right'>
					<Link className='header-link' to='/'>
						<img src={logo} className='header-logo-icon' />
						<span className='header-logo'>Workflow</span>
					</Link>
					<div className='tabs'>
						<NavLink to="/" className={setActive}>
							<div className="tab-link">Calendar</div>
						</NavLink>


						<NavLink to="/vacations" className={setActive}>
							<div className="tab-link">Vacations</div>
						</NavLink>


						<NavLink to="/settings" className={setActive}>
							<div className="tab-link">Settings</div>
						</NavLink>
					</div>
				</div>
			</div>
			{/* <div className='header-local'>
				<ControlPanel />
			</div> */}
		</div>
	)
}

export default Header