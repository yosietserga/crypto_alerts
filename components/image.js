import Image from 'next/image'

const public_path = process.env.NEXT_PUBLIC_IMAGE_PATH;

const myLoader = ({ src, width, quality }) => {
  return `http://localhost:3000${public_path}${src}?w=${width}&q=${quality || 75}`;
};

export default function Img({ s, a, c, w }) {
  c = c ?? "";



  return (
    <>
      <Image
        loader={myLoader}
        className={"ui-image" + (c ? " " : "") + c}
        src={s}
        layout="fill"
        alt={a ?? ""}
        width={w ?? ""}
      />
    </>
  );
}