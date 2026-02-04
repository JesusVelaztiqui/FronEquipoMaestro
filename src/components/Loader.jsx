const Loader = () => {
  return (
    <>
      <div className="cointainloader">
        <div className="loader-wrapper">
          <div className="loader-container">
            <svg
              className="arc-container"
              width="220"
              height="220"
              viewBox="0 0 220 220"
            >
              <circle
                className="arc-path"
                cx="110"
                cy="110"
                r="100"
                strokeDasharray="628"
                strokeDashoffset="471"
              />
            </svg>
            <div className="logo-center">
              <div className="logo-placeholder">
                <img src="/public/LogoSinFondo.png" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Loader;
