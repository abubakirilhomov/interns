import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MapPin, Check, ChevronDown } from "lucide-react";
import { switchActiveBranch } from "../../store/slices/authSlice";

// Reads branches from the persisted user blob. `loginIntern` populates
// `user.branches[].branch` with `{ _id, name }`, and `MarsId` flow does the
// same (server-side populate in marsIdAuthController.issueInternalSession).
const readActiveBranch = () => {
  try {
    return localStorage.getItem("activeBranchId");
  } catch {
    return null;
  }
};

const BranchSwitcher = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const branches = (user?.branches || [])
    .map((b) => {
      // Intern shape: { branch: {_id, name}, mentor, isHeadIntern, joinedAt }
      const branch = b?.branch && typeof b.branch === "object" ? b.branch : null;
      return branch ? { _id: String(branch._id), name: branch.name || "—" } : null;
    })
    .filter(Boolean);

  const activeId = String(user?.activeBranchId || readActiveBranch() || branches[0]?._id || "");
  const active = branches.find((b) => b._id === activeId);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  if (branches.length <= 1) return null;

  const handlePick = (id) => {
    if (id === activeId) {
      setOpen(false);
      return;
    }
    dispatch(switchActiveBranch(id));
    setOpen(false);
    // Hard reload so dashboard/lessons/rating slices refetch under the new
    // X-Active-Branch header — much simpler than tracking every slice.
    window.location.reload();
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="btn btn-ghost btn-sm normal-case gap-1.5"
        title="Сменить филиал"
      >
        <MapPin className="w-4 h-4" />
        <span className="hidden sm:inline max-w-[120px] truncate">
          {active?.name || "Филиал"}
        </span>
        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
      </button>

      {open && (
        <ul className="menu menu-sm absolute right-0 dropdown-content mt-3 z-20 p-2 shadow bg-base-100 rounded-box w-56">
          <li className="menu-title">
            <span>Сменить филиал</span>
          </li>
          {branches.map((b) => {
            const isActive = b._id === activeId;
            return (
              <li key={b._id}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePick(b._id);
                  }}
                  className={isActive ? "font-bold text-primary" : ""}
                >
                  <span className="flex-1 truncate">{b.name}</span>
                  {isActive && <Check className="w-4 h-4 flex-shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default BranchSwitcher;
