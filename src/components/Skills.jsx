function Skills({ skillList }) {
  return (
    <section className="card skills-card">
      <h2>Skills</h2>

      <p className="skills-copy">
        A mix of front-end development, data science foundations, and collaboration tools
        that support modern project workflows.
      </p>

      <ul className="skills-list">
        {skillList.map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>
    </section>
  );
}

export default Skills;