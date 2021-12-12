import warning_svg from './../../images/i-warning.svg';
const BadgeWarnings = (props) => {
    return  <>
        <img src={warning_svg} alt={"err"}/>
        <div className={"ml_item-ce"}>
            {props.counts}
        </div>
    </>
}

export default BadgeWarnings
