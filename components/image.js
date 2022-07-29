import Image from 'next/image'

const public_path = process.env.NEXT_PUBLIC_IMAGE_PATH;

const myLoader = ({ src, width, quality }) => {
  return `http://localhost:3000${public_path}${src}?w=${width}&q=${quality || 75}`;
};

export default function Img({ s, a, c, w, h }) {
  c = c ?? "";
  //const layout = !w && !h ? "fill" : "responsive";
  const layout = "fill";

  return (
    <>
      <Image
        loader={myLoader}
        className={"ui-image" + (c ? " " : "") + c}
        src={s}
        layout={layout}
        alt={a ?? ""}
      />
    </>
  );
}