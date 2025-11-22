const Dahsboard = () => {
  return (
    <>
      <header className="header">
        <div className="header-title">
          <p>Hi Nanas,</p>
          <h1>Welcome to Peymen</h1>
        </div>
        <div className="header-actions">
          <div className="notification-icon">🔔</div>
          <div className="user-avatar"></div>
        </div>
      </header>

      <div className="cards-grid">
        <div className="transfer-card">
          <div className="card-icon">
            <i className="fas fa-credit-card"></i>
          </div>
          <div className="card-label">Transfer via Card Number</div>
          <div className="card-amount">$1241</div>
        </div>

        <div className="transfer-card">
          <div className="card-icon">
            <i className="fas fa-building"></i>
          </div>
          <div className="card-label">Transfer other Bank</div>
          <div className="card-amount">$142</div>
        </div>

        <div className="transfer-card">
          <div className="card-icon">
            <i className="fas fa-upload"></i>
          </div>
          <div className="card-label">Transfer same Bank</div>
          <div className="card-amount">$155</div>
        </div>
      </div>

      <div className="featured-section">
        <div className="featured-content">
          <h2>Reach financial goals faster</h2>
          <p>
            Use your Peymen card around the world with no hidden fees. Hold,
            transfer and spend money.
          </p>
          <button className="learn-btn">Learn More</button>
        </div>

        <div className="card-display">
          <div className="card-type">
            <span>Universal Card</span>
            <div className="card-chip"></div>
          </div>
          <div className="card-number">5214 4321 5678 4345</div>
          <div className="card-info">
            <div className="card-holder">Nasyia Ulfa</div>
            <div className="card-expiry">12/24</div>
          </div>
        </div>
      </div>

      <div className="transactions-grid">
        <div className="transaction-section">
          <h2 className="section-title">Your Transaction</h2>

          <div className="transaction-item">
            <div className="transaction-icon">🛍️</div>
            <div className="transaction-details">
              <div className="transaction-name">Shopping</div>
              <div className="transaction-time">Today, 13:21</div>
            </div>
            <div className="transaction-amount negative">-$212</div>
          </div>

          <div className="transaction-item">
            <div className="transaction-icon">🎬</div>
            <div className="transaction-details">
              <div className="transaction-name">Movie</div>
              <div className="transaction-time">Today, 11:23</div>
            </div>
            <div className="transaction-amount negative">-$35</div>
          </div>
        </div>

        <div className="transaction-section">
          <h2 className="section-title">Your Transfer</h2>

          <div className="transaction-item">
            <div className="transfer-avatar"></div>
            <div className="transaction-details">
              <div className="transaction-name">Jenny Wilson</div>
              <div className="transaction-time">Today, 13:21</div>
            </div>
            <div className="transaction-amount positive">+$32</div>
          </div>

          <div className="transaction-item">
            <div className="transfer-avatar"></div>
            <div className="transaction-details">
              <div className="transaction-name">Dianne Russell</div>
              <div className="transaction-time">Today, 11:23</div>
            </div>
            <div className="transaction-amount negative">-$35</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dahsboard;
