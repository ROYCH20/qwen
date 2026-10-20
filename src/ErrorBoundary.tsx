import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="overlay-shell">
          <div className="hud-box">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
              <p className="fit-flow" style={{ fontSize: 'clamp(14px, 4vw, 16px)', lineHeight: 1.4 }}>
                Что-то пошло не так. Перезагрузите приложение.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn-neon btn-primary"
                style={{ width: '100%' }}
              >
                Перезагрузить
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
