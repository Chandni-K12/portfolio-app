import About from "../components/About";
import Skills from "../components/Skills";

function Home({ skills }) {
  return (
    <main className="content-grid">
      <About />
      <Skills skillList={skills} />
    </main>
  );
}

export default Home;
