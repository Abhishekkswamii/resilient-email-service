import React from 'react';

interface Provider {
  name: string;
  healthy: boolean;
  circuitState: string;
  responseTime: number;
}

interface ProviderStatusProps {
  providers: Provider[];
}

const ProviderStatus: React.FC<ProviderStatusProps> = ({ providers }) => {
  const getProviderType = (name: string) => {
    if (name.includes('Provider A')) return 'Primary';
    if (name.includes('Provider B')) return 'Fallback';
    return 'Unknown';
  };

  return (
    <div className="provider-status">
      {providers.length === 0 ? (
        <p>Loading providers...</p>
      ) : (
        providers.map((provider) => (
          <div key={provider.name} className={`provider-item ${provider.healthy ? 'healthy' : 'unhealthy'}`}>
            <div className="provider-header">
              <h4>{provider.name}</h4>
              <span className="provider-type">({getProviderType(provider.name)})</span>
            </div>
            <div className="provider-details">
              <div className="provider-metric">
                <span className="label">Status:</span>
                <span className={`status ${provider.healthy ? 'healthy' : 'unhealthy'}`}>
                  {provider.healthy ? 'Healthy' : 'Unhealthy'}
                </span>
              </div>
              <div className="provider-metric">
                <span className="label">Response Time:</span>
                <span className="value">{provider.responseTime}ms</span>
              </div>
              <div className="provider-metric">
                <span className="label">Circuit:</span>
                <span className={`circuit-state ${provider.circuitState?.toLowerCase()}`}>
                  {provider.circuitState || 'CLOSED'}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ProviderStatus;
