import { notFound } from 'next/navigation';
import ProjectDetail from '@/components/sections/ProjectDetail';
import { getProject, projects } from '@/data/projects';

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const title = `${project.title} — ${project.category.en}`;
  return {
    title,
    description: project.description.en,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title,
      description: project.description.en,
      url: `/projects/${project.slug}`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title, description: project.description.en },
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return <ProjectDetail slug={project.slug} />;
}
