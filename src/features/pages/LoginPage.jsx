const LoginPage = () => {
  return (
    <>
      <div className="login-page">
        <div className="login-container">
          <div className="login-form-section">
            <div className="form-wrapper">
              <h1 className="welcome-title">BIENVENIDOS 👋</h1>
              <p className="subtitle">Sitema de Odontología </p>
              <div className={`login-form login-mode `}>
                <div className="form-fields login-fields">
                  <div className="input-group">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      className="form-input"
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="password"
                      name="pass"
                      placeholder="Contraseña"
                      className="form-input"
                    />
                  </div>
                </div>

                <button type="button" className="submit-btn">
                  Ingresar
                </button>
              </div>
            </div>
          </div>

          <div className="image-section">
            <img
              src="/public/portadaEM.png"
              alt="Mountain landscape"
              className="background-image"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
