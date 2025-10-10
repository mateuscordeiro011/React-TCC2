export default function TestLayout({ children }) {
      return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f0f0f0',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Teste de Layout</h1>
      <div>{children}</div>
    </div>
  );
}