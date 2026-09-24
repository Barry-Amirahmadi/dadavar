import { notFound } from "@/content/sections";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

export default function NotFound() {
  return (
    <Section>
      <div className="grid-editorial">
        <div className="col-span-4 flex flex-col gap-6 md:col-span-8 lg:col-span-6">
          <Eyebrow>{notFound.eyebrow}</Eyebrow>
          <h1 className="t-h1">{notFound.heading}</h1>
          <p className="t-lead">{notFound.lead}</p>
          <div>
            <Button href={notFound.action.href}>{notFound.action.label}</Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
