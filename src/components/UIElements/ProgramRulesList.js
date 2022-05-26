import { useDataQuery } from '@dhis2/app-runtime';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import ShortTextIcon from '@mui/icons-material/ShortText';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import DangerousIcon from '@mui/icons-material/Dangerous';
import WarningIcon from '@mui/icons-material/Warning';
import RuleIcon from '@mui/icons-material/Rule';

import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';


const query = {
    results: {
        resource: 'programRuleActions',
        params: ({program,dataElement}) => (
        {
            filter: [`programRule.program.id:eq:${program}`,`dataElement.id:eq:${dataElement}`],
            fields: ['programRuleActionType,data,content,dataElement[id,name],programRule[id,name,condition]']
        })
    }
}

const formatAction = (action,i) =>{
    const ListItemStyle = { minHeight:'5em' }

    switch(action.programRuleActionType){
        case 'ASSIGN':
            return <ListItem key={i} style={ListItemStyle}>
                <ListItemAvatar>
                    <Avatar>
                        <ShortTextIcon />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={<span><strong>Assign value: </strong><i>{action.data}</i></span>}
                />
            </ListItem>

        case 'HIDEFIELD':
            return <ListItem key={i} style={ListItemStyle}>
                <ListItemAvatar>
                    <Avatar>
                        <VisibilityOffIcon />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={<span><strong>Hide this field</strong></span>}
                />
            </ListItem>
        
        case 'SETMANDATORYFIELD':
            return <ListItem key={i} style={ListItemStyle}>
                <ListItemAvatar>
                    <Avatar>
                        <PriorityHighIcon />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={<span><strong>Make this field required</strong></span>}
                />
            </ListItem>
        
        case 'SHOWERROR':
        case 'ERRORONCOMPLETE':
            return <ListItem key={i} style={ListItemStyle}>
                <ListItemAvatar>
                    <Avatar>
                        <DangerousIcon />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={
                        <div style={{display:'flex',flexDirection:'column'}}>
                            <span><strong>Show an error {action.programRuleActionType==='ERRORONCOMPLETE' && 'on "Complete Form"'} next to the field</strong></span>
                            {action.content && <span><strong>Static Text: </strong><i>{action.content}</i></span> }
                            {action.data && <span><strong>Expression to evaluate and show after static text: </strong><i>{action.data}</i></span>}
                        </div>
                    }
                />
            </ListItem>
        
        case 'SHOWWARNING':
        case 'WARNINGONCOMPLETE':
            return <ListItem key={i} style={ListItemStyle}>
                <ListItemAvatar>
                    <Avatar>
                        <WarningIcon />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={
                        <div style={{display:'flex',flexDirection:'column'}}>
                            <span><strong>Show a warning {action.programRuleActionType==='WARNINGONCOMPLETE' && 'on "Complete Form"'} next to the field</strong></span>
                            {action.content && <span><strong>Static Text: </strong><i>{action.content}</i></span> }
                            {action.data && <span><strong>Expression to evaluate and show after static text: </strong><i>{action.data}</i></span>}
                        </div>
                    }
                />
            </ListItem>
    }
}

/**
 * props: program (program UID), dataElement (data element UID)
 */
const ProgramRulesList = props => {
    const { data: programRuleActions } = useDataQuery(query, {variables: { program:props.program, dataElement:props.dataElement } });
    let programRules = programRuleActions?.results?.programRuleActions?.reduce((acu,cur)=>{
        if(acu[cur.programRule.name]) acu[cur.programRule.name].push(cur)
        else acu[cur.programRule.name] = [cur]
        return acu
    },{})
    if(programRules) programRules = Object.keys(programRules).map(rule => ({name:rule,actions:programRules[rule]}))

    return (
        <Accordion style={{marginTop:'1em'}}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color:'#FFF'}} />} sx={{backgroundColor:'#2c6693', color:'#FFF'}}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <RuleIcon color='inherit' style={{marginRight: '0.5em'}}/>
                    <span style={{verticalAlign: 'center'}}>Data Element Program Rules</span>
                </div>
            </AccordionSummary>
            <AccordionDetails>
                {
                    Array.isArray(programRules) &&  programRules.map((rule,i) => (
                        <Accordion style={{marginTop:'1em'}}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{backgroundColor:'#ebe9e9'}}>
                                <div style={{display:'flex', flexDirection:'column'}}>
                                    <h4>{rule.name}</h4>
                                    <span style={{marginTop:'1em'}}><strong>Condition: </strong><code>{rule.actions.at(0).programRule.condition}</code></span>
                                </div>

                            </AccordionSummary>
                            <AccordionDetails>
                                
                                <List dense={true}>
                                    {rule.actions.map(formatAction)}
                                </List>
                            </AccordionDetails>
                        </Accordion>
                    ))
                }
            </AccordionDetails>
        </Accordion>
    )

}
export default ProgramRulesList