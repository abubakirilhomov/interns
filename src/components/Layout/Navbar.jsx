import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { toggleSidebar } from '../../store/slices/uiSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
  };

  return (
    <div className="navbar bg-base-100 shadow-sm border-b border-base-200">
      <div className="flex-1">
        <button
          className="btn btn-ghost lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <a className="btn btn-ghost text-xl font-bold text-primary">
          <span className="hidden sm:inline">InternHub</span>
          <span className="sm:hidden">IH</span>
        </a>
      </div>
      
      <div className="flex-none">
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
              <span className="text-sm font-semibold">
                {user?.name?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase()}
              </span>
            </div>
          </div>
          {dropdownOpen && (
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li className="menu-title">
                <span>{user?.name} {user?.lastName}</span>
              </li>
              <li><a href="/profile">Профиль</a></li>
              <li><a href="/settings">Настройки</a></li>
              <li><button onClick={handleLogout}>Выйти</button></li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;