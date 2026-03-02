import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function CompanyDashboard() {
  const [job, setJob] = useState({
    title: "",
    company_name: "",
    min_cgpa: "",
    department: "",
    skill: "",
    max_backlogs: "",
  });

  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    api.get("/company/jobs")
      .then(res => setJobs(res.data))
      .catch(() => {});
  }, []);

  const postJob = async () => {
    await api.post("/company/post-job", {
      ...job,
      min_cgpa: Number(job.min_cgpa),
      max_backlogs: Number(job.max_backlogs),
    });

    alert("Job posted (awaiting approval)");

    const res = await api.get("/company/jobs");
    setJobs(res.data);
  };

  return (
    <>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h2>Company Dashboard</h2>

        <h3>Post New Job</h3>

        <input
          placeholder="Job Title"
          onChange={(e) => setJob({ ...job, title: e.target.value })}
        />
        <br />

        <input
          placeholder="Company Name"
          onChange={(e) =>
            setJob({ ...job, company_name: e.target.value })
          }
        />
        <br />

        <input
          placeholder="Min CGPA"
          type="number"
          step="0.1"
          onChange={(e) =>
            setJob({ ...job, min_cgpa: e.target.value })
          }
        />
        <br />

        <input
          placeholder="Department"
          onChange={(e) =>
            setJob({ ...job, department: e.target.value })
          }
        />
        <br />

        <input
          placeholder="Skill"
          onChange={(e) =>
            setJob({ ...job, skill: e.target.value })
          }
        />
        <br />

        <input
          placeholder="Max Backlogs"
          type="number"
          onChange={(e) =>
            setJob({ ...job, max_backlogs: e.target.value })
          }
        />
        <br />

        <button onClick={postJob}>Post Job</button>

        <hr />

        <h3>Your Jobs</h3>
        {jobs.length === 0 && <p>No jobs posted yet</p>}

        {jobs.map((j) => (
          <div
            key={j.id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <h4>{j.title}</h4>
            <p>
              Status:{" "}
              <strong>
                {j.is_approved ? "Approved" : "Pending Approval"}
              </strong>
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
