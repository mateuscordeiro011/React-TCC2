import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary capturou um erro:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '8px',
          border: '1px solid #ef9a9a',
          textAlign: 'center',
        }}>
          <h3>Algo deu errado.</h3>
          <p>Desculpe pelo inconveniente.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              background: '#c62828',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Recarregar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;