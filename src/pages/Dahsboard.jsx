import { cargarLoader, ocultarLoader } from "../hooks/LoaderManager";

const Dahsboard = () => {
  cargarLoader();
  ocultarLoader();
  return (
    <>
      <header className="header">
        <div className="header-title">
          <p>Bienvenido al Equipo Maestro</p>
          <h1>Dra Ana Solis</h1>
        </div>
      </header>

      <div className="cards-grid">
        <div className="transfer-card">
          <div className="card-icon">
            <i className="fas fa-credit-card" />
          </div>
          <div className="card-label">Total de Ingresos mensual</div>
          <div className="card-amount">₲ 50.000.000</div>
        </div>

        <div className="transfer-card">
          <div className="card-icon">
            <i className="fas fa-upload" />
          </div>
          <div className="card-label">Total Egreso mensual</div>
          <div className="card-amount">₲ 10.000.000</div>
        </div>

        <div className="transfer-card">
          <div className="card-icon">
            <i className="fas fa-building" />
          </div>
          <div className="card-label">Total Pacientes mensual</div>
          <div className="card-amount">100</div>
        </div>
      </div>

      <div className="transactions-grid">
        <div className="transaction-section">
          <h2 className="section-title">Siguientes Turnos hoy</h2>

          <div className="transaction-item">
            <div className="transaction-icon">
              {" "}
              <i className="fas fa-user" />
            </div>
            <div className="transaction-details">
              <div className="transaction-name">Carlo Villagra</div>
              <div className="transaction-time">hoy, 13:20</div>
            </div>
            <div className="transaction-amount negative">Siguiente</div>
          </div>

          <div className="transaction-item">
            <div className="transaction-icon">
              {" "}
              <i className="fas fa-user" />
            </div>
            <div className="transaction-details">
              <div className="transaction-name">Juan Lopez</div>
              <div className="transaction-time">14:20</div>
            </div>
            <div className="transaction-amount negative">Siguiente</div>
          </div>
          <div className="transaction-item">
            <div className="transaction-icon">
              {" "}
              <i className="fas fa-user" />
            </div>
            <div className="transaction-details">
              <div className="transaction-name">Carlo Villagra</div>
              <div className="transaction-time">hoy, 13:20</div>
            </div>
            <div className="transaction-amount negative">Siguiente</div>
          </div>

          <div className="transaction-item">
            <div className="transaction-icon">
              {" "}
              <i className="fas fa-user" />
            </div>
            <div className="transaction-details">
              <div className="transaction-name">Juan Lopez</div>
              <div className="transaction-time">14:20</div>
            </div>
            <div className="transaction-amount negative">Siguiente</div>
          </div>
          <div className="transaction-item">
            <div className="transaction-icon">
              {" "}
              <i className="fas fa-user" />
            </div>
            <div className="transaction-details">
              <div className="transaction-name">Carlo Villagra</div>
              <div className="transaction-time">hoy, 13:20</div>
            </div>
            <div className="transaction-amount negative">Siguiente</div>
          </div>

          <div className="transaction-item">
            <div className="transaction-icon">
              {" "}
              <i className="fas fa-user" />
            </div>
            <div className="transaction-details">
              <div className="transaction-name">Juan Lopez</div>
              <div className="transaction-time">14:20</div>
            </div>
            <div className="transaction-amount negative">Siguiente</div>
          </div>
        </div>

        <div className="transaction-section">
          <h2 className="section-title">Pacientes Atendidos Hoy</h2>

          <div className="transaction-item">
            <div className="transaction-icon">
              {" "}
              <i className="fas fa-user" />
            </div>
            <div className="transaction-details">
              <div className="transaction-name">Jenny Wilson</div>
              <div className="transaction-time">hoy, 12:20</div>
            </div>
            <div className="transaction-amount positive">Atendido</div>
          </div>

          <div className="transaction-item">
            <div className="transaction-icon">
              {" "}
              <i className="fas fa-user" />
            </div>
            <div className="transaction-details">
              <div className="transaction-name">Dianne Russell</div>
              <div className="transaction-time">hoy, 11:20</div>
            </div>
            <div className="transaction-amount positive">Atendido</div>
          </div>

          <div className="transaction-item">
            <div className="transaction-icon">
              {" "}
              <i className="fas fa-user" />
            </div>
            <div className="transaction-details">
              <div className="transaction-name">Jenny Wilson</div>
              <div className="transaction-time">hoy, 12:20</div>
            </div>
            <div className="transaction-amount positive">Atendido</div>
          </div>

          <div className="transaction-item">
            <div className="transaction-icon">
              {" "}
              <i className="fas fa-user" />
            </div>
            <div className="transaction-details">
              <div className="transaction-name">Dianne Russell</div>
              <div className="transaction-time">hoy, 11:20</div>
            </div>
            <div className="transaction-amount positive">Atendido</div>
          </div>

          <div className="transaction-item">
            <div className="transaction-icon">
              {" "}
              <i className="fas fa-user" />
            </div>
            <div className="transaction-details">
              <div className="transaction-name">Jenny Wilson</div>
              <div className="transaction-time">hoy, 12:20</div>
            </div>
            <div className="transaction-amount positive">Atendido</div>
          </div>

          <div className="transaction-item">
            <div className="transaction-icon">
              {" "}
              <i className="fas fa-user" />
            </div>
            <div className="transaction-details">
              <div className="transaction-name">Dianne Russell</div>
              <div className="transaction-time">hoy, 11:20</div>
            </div>
            <div className="transaction-amount positive">Atendido</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dahsboard;
