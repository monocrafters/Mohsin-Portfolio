import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Contact from "@/components/sections/Contact";
import { getAllProjectsPublic } from "@/lib/projects";

export default async function Home() {
  const projects = await getAllProjectsPublic().catch(() => []);

  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Projects initialProjects={projects} />
      <Contact />
    </>
  );
}
