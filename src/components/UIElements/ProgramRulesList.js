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


const queryActions = {
    results: {
        resource: 'programRuleActions',
        params: ({program,dataElement}) => (
        {
            filter: [`programRule.program.id:eq:${program}`,`dataElement.id:eq:${dataElement}`],
            fields: ['programRuleActionType,data,content,dataElement[id,name],programRule[id,name,condition]'],
            pageSize: 1000
        })
    }
}

const queryRules = {
    results: {
        resource: 'programRules',
        params: ({program,variable}) => (
        {
            filter: [`program.id:eq:${program}`,`condition:ilike:${variable}`],
            fields: ['id,name,condition,programRuleActions[programRuleActionType,data,content,dataElement[id,name],programRule[id,name,condition]]'],
            pageSize: 1000
        })
    }
}

const queryRules2 = {
    results: {
        resource: 'programRules',
        params: ({program,prVars}) => (
        {
            filter: /* [`program.id:eq:${program}`].concat( */prVars.map(v => `condition:ilike:${v.name}`),
            fields: ['id,name,program,condition,programRuleActions[programRuleActionType,data,content,dataElement[id,name],programRule[id,name,condition]]'],
            paging: false,
            rootJunction: 'OR'
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
                    primary={<span><strong>Assign value: </strong><i>{action.data}</i> <br/><strong>To: </strong>{action.dataElement.name} <code>[{action.dataElement.id}]</code></span>}
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
                    primary={<span><strong>Hide field: </strong>{action.dataElement.name} <code>[{action.dataElement.id}]</code></span>}
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
                    primary={<span><strong>Make field required: </strong> {action.dataElement.name} <code>[{action.dataElement.id}]</code></span>}
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

    const { data: programRulesTrig } = useDataQuery(queryRules2, {variables: { program:props.program, prVars:props.variables } });
    let programRulesTriggered = programRulesTrig?.results?.programRules?.filter(pr => pr.programRuleActions.length > 0 && (pr.program.id === props.program)).map(pr => ({
        name:pr.name, 
        actions: pr.programRuleActions//.filter(pra => pra.dataElement?.id === props.dataElement)
    }))

    const { data: programRuleActions } = useDataQuery(queryActions, {variables: { program:props.program, dataElement:props.dataElement } });
    let programRules = programRuleActions?.results?.programRuleActions?.reduce((acu,cur)=>{
        if(acu[cur.programRule.name]) acu[cur.programRule.name].push(cur)
        else acu[cur.programRule.name] = [cur]
        return acu
    },{})
    if(programRules) programRules = Object.keys(programRules).map(rule => ({name:rule,actions:programRules[rule]}))

    /* const { data: programRulesData } = useDataQuery(queryRules, {variables: { program:props.program, variable:props.variable } });
    let programRulesTriggered = programRulesData?.results?.programRules?.map(pr => ({
            name:pr.name, 
            actions: pr.programRuleActions//.filter(pra => pra.dataElement?.id === props.dataElement)
        })
    ).filter(pr => pr.actions.length > 0) */

    return (
        <>
            <Accordion style={{marginTop:'1em'}}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color:'#FFF'}} />} sx={{backgroundColor:'#2c6693', color:'#FFF'}}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <RuleIcon color='inherit' style={{marginRight: '0.5em'}}/>
                        <span style={{verticalAlign: 'center'}}>Program Rules that affects this data element (Total: {programRules?.reduce((acu,cur) => acu + cur.actions?.length,0)})</span>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    {
                        Array.isArray(programRules) &&  programRules.map((rule,i) => (
                            <Accordion style={{marginTop:'1em'}} key={i}>
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
            <Accordion style={{marginTop:'1em'}}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color:'#FFF'}} />} sx={{backgroundColor:'#2c6693', color:'#FFF'}}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <RuleIcon color='inherit' style={{marginRight: '0.5em'}}/>
                        <span style={{verticalAlign: 'center'}}>Program Rules triggered by the data element (Total: {programRulesTriggered?.reduce((acu,cur) => acu + cur.actions?.length,0)})</span>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    {
                        Array.isArray(programRulesTriggered) &&  programRulesTriggered.map((rule,i) => (
                            <Accordion style={{marginTop:'1em'}} key={i}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{backgroundColor:'#ebe9e9'}}>
                                    <div style={{display:'flex', flexDirection:'column'}}>
                                        <h4>{rule.name} (Total: {rule.actions?.length})</h4>
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
        </>
    )

}
export default ProgramRulesList