export default function Container({ children }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
        marginLeft: "auto",
        marginRight: "auto",
        padding: "0 24px",
      }}
    >
      {children}
    </div>
  );
}
