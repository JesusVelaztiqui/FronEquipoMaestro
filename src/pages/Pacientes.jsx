import { useState } from "react";

const Pacientes = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const mockPapers = [
    {
      id: 1,
      question: "ISC Class XI Mid-term 2024",
      year: "2024",
      student: "Jho Smith",
      pages: "03",
      questions: "40",
      responses: "27",
    },
    {
      id: 2,
      question: "ISC Class XI Mid-term 2024",
      year: "2024",
      student: "Jho Smith",
      pages: "03",
      questions: "40",
      responses: "27",
    },
    {
      id: 3,
      question: "ISC Class XI Mid-term 2024",
      year: "2024",
      student: "Jho Smith",
      pages: "03",
      questions: "40",
      responses: "27",
    },
    {
      id: 4,
      question: "ISC Class XI Mid-term 2024",
      year: "2024",
      student: "Jho Smith",
      pages: "03",
      questions: "40",
      responses: "27",
    },
    {
      id: 5,
      question: "ISC Class XI Mid-term 2024",
      year: "2024",
      student: "Jho Smith",
      pages: "03",
      questions: "40",
      responses: "27",
    },
    {
      id: 6,
      question: "ISC Class XI Mid-term 2024",
      year: "2024",
      student: "Jho Smith",
      pages: "03",
      questions: "40",
      responses: "27",
    },
  ];

  return (
    <>
      <div className="mock-papers">
        <div className="mock-papers__header">
          <div>
            <h1 className="mock-papers__title">Pacientes</h1>
            <p className="mock-papers__subtitle">
              Gestiona el registro y seguimiento de tus pacientes
            </p>
          </div>

          <div className="mock-papers__search">
            <div className="input-group">
              <div className="input-search">
                <input
                  type="text"
                  className="input-field input-field--search"
                  placeholder="Buscar..."
                />
                <svg
                  className="input-search__icon"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <button className="mock-papers__upload-btn">
            NUEVO <i className="fas fa-plus" />
          </button>
        </div>

        <div className="mock-papers__table-card">
          <div className="mock-papers__table-wrapper">
            <table className="mock-papers__table">
              <thead>
                <tr>
                  <th>S. Number</th>
                  <th>Question</th>
                  <th>Year</th>
                  <th>Student</th>
                  <th>Pages</th>
                  <th>Questions</th>
                  <th>Responses</th>
                </tr>
              </thead>
              <tbody>
                {mockPapers.map((paper, index) => (
                  <tr key={paper.id}>
                    <td>{String(index + 1).padStart(2, "0")}</td>
                    <td>{paper.question}</td>
                    <td>{paper.year}</td>
                    <td>{paper.student}</td>
                    <td>{paper.pages}</td>
                    <td>{paper.questions}</td>
                    <td>{paper.responses}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mock-papers__pagination">
            <button
              className={`mock-papers__page-btn ${
                currentPage === 1 ? "active" : ""
              }`}
              onClick={() => setCurrentPage(1)}
            >
              1
            </button>
            <button
              className="mock-papers__page-btn"
              onClick={() => setCurrentPage(2)}
            >
              2
            </button>
            <span className="mock-papers__dots">...</span>
            <button className="mock-papers__page-btn">6</button>
            <button className="mock-papers__page-btn">7</button>
            <button className="mock-papers__page-btn">8</button>
            <button className="mock-papers__arrow-btn">→</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pacientes;
