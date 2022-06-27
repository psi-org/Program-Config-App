import { CircularLoader } from "@dhis2/ui";

const LoadingPage = () => {
    return (
        <div>
            <div className="sub_nav">
                <div className="cnt_p"></div>
                <div className="c_srch"></div>
                <div className="c_btns"></div>
            </div>
            <div className="wrapper" style={{display: 'flex', justifyContent: 'center'}}>
                <CircularLoader />
            </div>
        </div>
    );
}

export default LoadingPage;

