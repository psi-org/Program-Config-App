import error_svg from './../../images/i-error.svg';
const BadgeErrors = (props) => {
    return  <>
                <img src={error_svg} alt={"err"}/>
                <div className={"ml_item-cw"}>
                    {props.counts}
                </div>
            </>
}

export default BadgeErrors
