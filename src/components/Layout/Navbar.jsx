import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { toggleSidebar, setTheme } from "../../store/slices/uiSlice";
import { FiMenu } from "react-icons/fi";
import { MdColorLens } from "react-icons/md";
import { Link } from "react-router-dom";

const Navbar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.ui);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const themeRef = useRef(null);
  const userRef = useRef(null);

  const themes = [
    "light",
    "dark",
    "cupcake",
    "bumblebee",
    "emerald",
    "corporate",
    "synthwave",
    "retro",
    "cyberpunk",
    "valentine",
    "halloween",
    "garden",
    "forest",
    "aqua",
    "lofi",
    "pastel",
    "fantasy",
    "wireframe",
    "black",
    "luxury",
    "dracula",
    "cmyk",
    "autumn",
    "business",
    "acid",
    "lemonade",
    "night",
    "coffee",
    "winter",
    "dim",
    "nord",
    "sunset",
    "caramellatte",
    "abyss",
    "silk",
  ];

  // Применяем тему к html при изменении
  useEffect(() => {
    if (theme) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  // Обработка кликов вне dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        (themeRef.current && !themeRef.current.contains(e.target)) &&
        (userRef.current && !userRef.current.contains(e.target))
      ) {
        setDropdownOpen(false);
        setThemeDropdownOpen(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setThemeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleThemeChange = (selectedTheme) => {
    dispatch(setTheme(selectedTheme));
    setThemeDropdownOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
  };

  const getInitials = () => {
    const a = user?.name?.trim()?.[0]?.toUpperCase() || "";
    const b = user?.lastName?.trim()?.[0]?.toUpperCase() || "";
    return a + b || user?.name?.slice(0, 2)?.toUpperCase() || "U";
  };

  return (
    <div className="navbar bg-base-100 shadow-sm border-b border-base-200">
      <div className="flex-1">
        <button
          type="button"
          className="btn btn-ghost lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        >
          <FiMenu className="w-6 h-6" />
        </button>
        <a className="btn btn-ghost text-xl font-bold text-primary">
          <span className="hidden sm:inline">InternHub</span>
          <span className="sm:hidden">IH</span>
        </a>
      </div>

      <div className="flex gap-2 items-center">
        {/* Theme Dropdown */}
        <div className="relative" ref={themeRef}>
          <button
            type="button"
            className="btn btn-ghost btn-circle"
            onClick={(e) => {
              e.stopPropagation();
              setThemeDropdownOpen((prev) => !prev);
              setDropdownOpen(false);
            }}
          >
            <MdColorLens className="w-6 h-6" />
          </button>

          {themeDropdownOpen && (
            <ul className="menu menu-sm gap-2 absolute right-0 dropdown-content mt-3 z-20 p-2 shadow bg-base-100 rounded-box w-52 max-h-96 overflow-y-auto">
              <li className="menu-title">
                <span>Выберите тему</span>
              </li>
              {themes.map((thm) => (
                <li data-theme={thm} className="rounded" key={thm}>
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      handleThemeChange(thm);
                    }}
                    className={`w-full min-w-32 p-4 text-left ${
                      theme === thm ? "font-bold text-primary" : ""
                    }`}
                  >
                    {thm.charAt(0).toUpperCase() + thm.slice(1)}
                    {theme === thm && " ✓"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="relative" ref={userRef}>
          <button
            type="button"
            className="btn btn-ghost btn-circle avatar"
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen((prev) => !prev);
              setThemeDropdownOpen(false);
            }}
          >
            <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
              <span className="text-sm w-full flex justify-center items-center h-full font-semibold">{getInitials()}</span>
            </div>
          </button>

          {dropdownOpen && (
            <ul className="menu absolute right-0 menu-sm dropdown-content mt-3 z-20 p-2 shadow bg-base-100 rounded-box w-52">
              <li className="flex items-center justify-center">
                <span className="">
                  {user?.name} {user?.lastName}
                </span>
              </li>
              <li>
                <Link to="/profile">Профиль</Link>
              </li>
              <li>
                <button onClick={handleLogout}>Выйти</button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;