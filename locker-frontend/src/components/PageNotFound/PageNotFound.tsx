import error_png from '../../assets/404.png'


export const PageNotFound = () => {
  return (
    <div>
      <div className="main-content">

        <div className="page-content">

          <section className="bg-error bg-auth text-dark">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-lg-6">
                  <div className="text-center">
                    <img src={error_png} alt="" className="img-fluid"/>
                      <div className="mt-5">
                        <h4 className="text-uppercase mt-3">Page Not Found</h4>
                        <p className="text-muted">Sorry, but this page does not exists</p>
                        <div className="mt-4">
                          <a className="btn btn-primary waves-effect waves-light" href="/"><i
                            className="mdi mdi-home"></i>Back to home</a>
                        </div>
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  )
}