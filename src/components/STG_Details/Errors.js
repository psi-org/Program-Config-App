import error_svg from './../../images/i-error.svg';
const Errors = (props) => {
    return  <>
                <img src={error_svg} alt={"err"}/>
                <div className={"ml_item-ce"}>
                    {props.counts}
                </div>
            </>
}

export default Errors
