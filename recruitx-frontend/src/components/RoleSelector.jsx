export default function RoleSelector({ role, setRole }) {
  const roles = [
    { key: "student", label: "Student" },
    { key: "placement", label: "Placement Team" },
    { key: "company", label: "Company" },
  ];

  return (
    <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
      {roles.map(r => (
        <button
          key={r.key}
          className={`role ${role === r.key ? "active" : ""}`}
          onClick={() => setRole(r.key)}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}