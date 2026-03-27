import SigninMain from "./SigninMain";

const Signin = () => {
  return (
    <>
      <section className="overflow-hidden manrope py-3 bg-center manrope  bg-cover bg-no-repeat"
       style={{ backgroundImage: "url('/images/banner/bms-footer2.jpg')" }}
      >
        <div className="max-w-292.5 w-full mx-auto pt-18 lg:pt-28 px-4 sm:px-8 xl:px-0">
          <SigninMain />
        </div>
      </section>
    </>
  );
};

export default Signin;