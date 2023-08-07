import warning_svg from './../../images/i-warning.svg';
const BadgeWarnings = ({ counts }) => {
    return  <>
        <img src={warning_svg} alt={"err"}/>
        <div className={"ml_item-ce"}>
            {counts}
        </div>
    </>
}

export default BadgeWarnings
