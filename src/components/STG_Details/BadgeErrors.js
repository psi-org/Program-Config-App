import error_svg from './../../images/i-error.svg';
const BadgeErrors = ({counts}) => {
    return  <>
                <img src={error_svg} alt={"err"}/>
                <div className={"ml_item-cw"}>
                    {counts}
                </div>
            </>
}

export default BadgeErrors
