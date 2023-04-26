import Navbar from "../NavBar/NavBar";
import './HomePage.css';
import IonIcon from "@reacticons/ionicons";
import frame_1 from "../../assets/Frame 1.svg";
import frame_2 from "../../assets/Frame 2.svg";
import frame_3 from "../../assets/Frame 3.svg";
import frame_4 from "../../assets/Frame 4.svg";
import {Component} from "react";
import {getCities, getStorages} from "../../services/api";
import {SearchBar} from "../SearchBar/SearchBar";

type HomeState = {
  loader_active: boolean,
  search_city: string,
  cities: []
};

interface HomeProps {
}

class HomePage extends Component<HomeProps, HomeState> {
  constructor(props: HomeProps) {
    super(props);
    this.state = {
      loader_active: false,
      search_city: '',
      cities: []
    }
  }

  async componentWillMount() {
    const response = await getCities()
    if (response.status === 200) {
      this.setState({
        cities: response.data.cities
      })
    }
  }

  async search(city: string) {
    window.location.href = '/storages?city=' + city;
  }

  render() {
    return (
      <>
        <Navbar/>
        <div className="main">
          <div>
            <div className="d-flex flex-row flex-wrap search-container">
              <div className="d-flex w-100">
                <div className='ml-0 pl-0 col title_find d-flex items-center align-items-center'>
                  <h1 className="text-center ti fw-bold">FIND</h1>
                </div>
                <div className='col title_find d-flex items-center align-items-center'>
                  <IonIcon name="location-sharp" className="location-sharp"
                           style={{width: "74px", height: "88px", fill: "#87BC24"}}/>
                </div>
                <div className='col title_your d-flex align-items-center'>
                  <h1 className="text-center ti fw-bold">YOUR</h1>
                </div>
                <div className='col title_find d-flex items-center align-items-center'>
                  <IonIcon name="arrow-forward-circle" className="arrow-forward-circle"
                           style={{width: "73px", height: "83px", fill: "#87BC24"}}/>
                </div>
                <div className='mr-0 pr-0 col title_your d-flex'>
                  <h1 className="text-center ti">STORAGE</h1>
                </div>
              </div>
              <div className="d-flex w-100" style={{maxWidth: "100%"}}>
                <div className="w-100" id="search">
                  <form className="search-form">
                    <SearchBar search_city={this.state.search_city} cities={this.state.cities}/>
                    {/*<div className="search-box">*/}
                    {/*  <input type="text"*/}
                    {/*         placeholder="search city"*/}
                    {/*          list="cities"*/}
                    {/*         className="search-input"*/}
                    {/*         onChange={(e) => {*/}
                    {/*           this.setState({search_city: e.target.value})*/}
                    {/*         }}*/}

                    {/*  />*/}
                    {/*  <button type="submit"*/}
                    {/*          onClick={async (e) => {*/}
                    {/*            e.preventDefault();*/}
                    {/*            await this.search(this.state.search_city);*/}
                    {/*          }}*/}
                    {/*          className="btn-search btn-primary btn-regular d-md-block d-none">*/}
                    {/*    search*/}
                    {/*  </button>*/}
                    {/*</div>*/}
                  </form>
                </div>
              </div>
            </div>
            <div className="search-container pt-5">
              <div className="d-flex w-100">
                <h1 className="text-uppercase">you need only 4 steps for an easy walk</h1>
              </div>
              <div className="align-items-start d-grid"
                   style={{gridTemplateColumns: 'repeat(4, 1fr)', columnGap: '30px'}}>
                <div
                  className="col card-step p-4">
                  <div className="col-12 mr-md-0 mr-4 mb-md-4 px-0">
                    <picture>
                      <img src={frame_1}/>
                    </picture>
                  </div>
                  <div className="col-md-12 col px-md-0 pr-0">
                    <div className="col-12 mb-2 px-0 text-fs-12 text-color-light">step 1</div>
                    <div className="title col-12 mb-2 px-0 text-fs-18 text-uppercase tip-title">Locate</div>
                    <p className="col-12 mb-2 px-0 text-fs-12 text-color-light">find storage on map</p>
                  </div>
                </div>
                <div
                  className="col card-step p-4">
                  <div className="col-12 mr-md-0 mr-4 mb-md-4 px-0">
                    <picture>
                      <img src={frame_2}/>
                    </picture>
                  </div>
                  <div className="col-md-12 col px-md-0 pr-0">
                    <div className="col-12 mb-2 px-0 text-fs-12 text-color-light">step 2</div>
                    <div className="title col-12 mb-2 px-0 text-fs-18 text-uppercase tip-title">Book</div>
                    <p className="col-12 mb-2 px-0 text-fs-12 text-color-light">pay for storage online</p>
                  </div>
                </div>
                <div
                  className="col card-step p-4">
                  <div className="col-12 mr-md-0 mr-4 mb-md-4 px-0">
                    <picture>
                      <img src={frame_3}/>
                    </picture>
                  </div>
                  <div className="col-md-12 col px-md-0 pr-0">
                    <div className="col-12 mb-2 px-0 text-fs-12 text-color-light">step 3</div>
                    <div className="title col-12 mb-2 px-0 text-fs-18 text-uppercase tip-title">Store</div>
                    <p className="col-12 mb-2 px-0 text-fs-12 text-color-light">store your suitcase</p>
                  </div>
                </div>
                <div
                  className="col card-step p-4">
                  <div className="col-12 mr-md-0 mr-4 mb-md-4 px-0">
                    <picture>
                      <img src={frame_4}/>
                    </picture>
                  </div>
                  <div className="col-md-12 col px-md-0 pr-0">
                    <div className="col-12 mb-2 px-0 text-fs-12 text-color-light">step 4</div>
                    <div className="title col-12 mb-2 px-0 text-fs-18 text-uppercase tip-title">Enjoy</div>
                    <p className="col-12 mb-2 px-0 text-fs-12 text-color-light">enjoy your hands-free walking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

};

export default HomePage;