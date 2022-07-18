//walk through all images into public folder
function importAll(r) {
  let images = {};
  r.keys().map((item) => {
    images[item.replace("./", "")] = r(item).default.src;
  });
  return images;
}

//get images array
let cacheImages = {};
cacheImages = importAll(
  require.context(
    process.env.NEXT_PUBLIC_IMAGE_PATH,
    true,
    /\.(png|jpe?g|svg)$/
  )
);

export default function Img({ s, a, c, w }) {
  /*
  let subfolders = s.split('/');
  let basedir = process.env.NEXT_PUBLIC_IMAGE_PATH;

  if (subfolders.length>0) {
    let f = subfolders.pop();
    basedir += subfolders.join('/') +"/";
  }
  */

  //not chached? let's get it
  if (!cacheImages[s]) {
    let images = importAll(
      require.context(
        process.env.NEXT_PUBLIC_IMAGE_PATH,
        true,
        /\.(png|jpe?g|svg)$/
      )
    );

    cacheImages = { ...cacheImages, images };
  }

  c = c ?? "";
  return (
    <>
      {!!cacheImages[s] && (
        <img
          className={"ui-image" + (c ? " " : "") + c}
          src={cacheImages[s]}
          layout="fill"
          alt={a ?? ""}
          width={w ?? ""}
        />
      )}

      {/*
      {!!cacheImages[s] && (
        <Image
        className={c+" ui-image"}
          src={cacheImages[s].default}
          layout="fill"
          alt={a ?? ""}
        />
      )}
      */}
      {!cacheImages[s] && <small>Image not found: {s}</small>}
    </>
  );
}