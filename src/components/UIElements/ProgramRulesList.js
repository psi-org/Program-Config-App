import {useState,useEffect} from "react"
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

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

/**
 * PROGRAM RULE ACTIONS ACTING OVER CURRENT DATA ELEMENT
 */
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

/* const queryRules = {
    results: {
        resource: 'programRules',
        params: ({program,variable}) => (
        {
            filter: [`program.id:eq:${program}`,`condition:ilike:${variable}`],
            fields: ['id,name,condition,programRuleActions[programRuleActionType,data,content,dataElement[id,name],programRule[id,name,condition]]'],
            pageSize: 1000
        })
    }
} */

/**
 * PROGRAM RULES TRIGGERED BY THE CURRENT DATA ELEMENT
 */
const queryRules = {
    results: {
        resource: 'programRules',
        params: ({program,prVars}) => (
        {
            filter: prVars.map(v => `condition:ilike:${v.name}`),
            fields: ['id,name,program,condition,programRuleActions[programRuleActionType,data,content,dataElement[id,name],programRule[id,name,condition]]'],
            paging: false,
            rootJunction: 'OR'
        })
    }
}

/**
 * PROGRAM RULE FOR CURRENT SCORE
 */
 const scoreActions = {
    results: {
        resource: 'programRuleActions',
        params: ({program,compositiveIndicator}) => (
        {
            filter: [`programRule.program.id:eq:${program}`,`content:like:_CV_CS${compositiveIndicator}`],
            fields: ['programRuleActionType,data,content,dataElement[id,name],programRule[id,name,condition]'],
            pageSize: 1000
        })
    }
}

const formatAction = (action,i,self) =>{
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
                    style={{overflowWrap:'break-word'}}
                    primary={
                    <span><strong>Assign value: </strong><i>{action.data}</i> <br/><strong>To: </strong>{action.dataElement?.name ?? action.content} <code>[{action.dataElement?.id ?? ''}]</code></span>}
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
                            <span><strong>Show an error {action.programRuleActionType==='ERRORONCOMPLETE' && 'on "Complete Form"'} next to the field</strong> {action.dataElement.name} <code>[{action.dataElement.id}]</code></span>
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
                            <span><strong>Show a warning {action.programRuleActionType==='WARNINGONCOMPLETE' && 'on "Complete Form"'} next to the field</strong> {action.dataElement.name} <code>[{action.dataElement.id}]</code></span>
                            {action.content && <span><strong>Static Text: </strong><i>{action.content}</i></span> }
                            {action.data && <span><strong>Expression to evaluate and show after static text: </strong><i>{action.data}</i></span>}
                        </div>
                    }
                />
            </ListItem>
    }
}

const ProgramRulesGroup = (title,programRules,self=false) => {

    const totalProgramRuleActions = programRules.reduce((total,rule) => total + rule.actions.length,0)

    return (
        <Accordion style={{marginTop:'1em'}}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color:'#FFF'}} />} sx={{backgroundColor:'#2c6693', color:'#FFF'}}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <RuleIcon color='inherit' style={{marginRight: '0.5em'}}/>
                    <span style={{verticalAlign: 'center'}}>{title} ( Total  Rules: {programRules.length} , Total Actions: {totalProgramRuleActions} )</span>
                </div>
            </AccordionSummary>
            <AccordionDetails>
                {
                    programRules.map((rule,i) => (
                        <Accordion style={{marginTop:'1em'}} key={i} disabled={rule.actions.length === 0}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{backgroundColor:'#ebe9e9'}}>
                                <div style={{ width:"100%", display: "grid", gridTemplateColumns: "2fr 1fr", gridTemplateRrows: "1fr"}}>
                                    <div style={{  display:'flex', flexDirection:'column'}}>
                                        <h4>{rule.name}</h4>
                                        <span style={{marginTop:'1em'}}><strong>Condition: </strong><code>{rule.condition}</code></span>
                                    </div>
                                    <div style={{  textAlign:"center"}}>
                                        <span style={{marginTop:'1em'}}><strong>Actions: </strong><code>{rule.actions.length}</code></span>
                                    </div>
                                </div>
                                
                            </AccordionSummary>
                            <AccordionDetails>
                                <List dense={true}>
                                    {rule.actions.map((action,index)=>formatAction(action,index,self))}
                                </List>
                            </AccordionDetails>
                        </Accordion>
                    ))
                }
            </AccordionDetails>
        </Accordion>
    )
}

/**
 * props: program (program UID), dataElement (data element UID)
 */
const ProgramRulesList = props => {

    const [tab,setTab] = useState(0)

    const { data: programRulesTrig, refetch: refetchProgramRulesTrig } = useDataQuery(queryRules, {lazy:true, variables: { program:props.program, prVars:props.variables } });
    let programRulesTriggered = programRulesTrig?.results?.programRules.filter(pr => pr.program.id === props.program).map(pr => ({
        id: pr.id,
        name: pr.name,
        condition: pr.condition,
        actions: pr.programRuleActions
    }))

    const { data: programRuleActions } = useDataQuery(queryActions, {variables: { program:props.program, dataElement:props.dataElement } });
    let programRulesActing = Object.values(
        programRuleActions?.results?.programRuleActions?.reduce((rules,action) => {
            if(!rules[action.programRule.id]) rules[action.programRule.id] = {id: action.programRule.id, name:action.programRule.name, condition: action.programRule.condition, actions: [action] }
            else rules[action.programRule.id].actions.push(action)
            return rules
        },{}) ?? {}
    )

    const { data: scoreRuleActions, refetch: refetchScoreActions } = useDataQuery(scoreActions, {lazy: true, variables: { program:props.program, compositiveIndicator:props.compositiveIndicator } });
    let programRulesScore = Object.values(
        scoreRuleActions?.results?.programRuleActions?.reduce((rules,action) => {
            if(!rules[action.programRule.id]) rules[action.programRule.id] = {id: action.programRule.id, name:action.programRule.name, condition: action.programRule.condition, actions: [action] }
            else rules[action.programRule.id].actions.push(action)
            return rules
        },{}) ?? {}
    )

    useEffect(()=>{
        // Get ProgramRulesTrig
        if(!props.compositiveIndicator) refetchProgramRulesTrig({variables: { program:props.program, prVars:props.variables }})

        // Get Score Program Rules
        if(props.compositiveIndicator) refetchScoreActions({variables: { program:props.program, compositiveIndicator:props.compositiveIndicator }})
    },[])

    useEffect(()=>{
        //console.log(tab)
    },[tab])

    return (
        <Box sx={{ width: '100%', marginTop:"1em", bgcolor: '#eeeeee', padding:"1em" }}>
            <Tabs centered
                value={tab}
                onChange={(prev,current)=>setTab(current)}
            >
                <Tab icon={<RuleIcon />} iconPosition="start" label="Program Rules acting over this Data Element" />
                {!props.compositiveIndicator && <Tab icon={<RuleIcon />} iconPosition="start" label="Program Rules triggered by this Data Element" />}
                {props.compositiveIndicator && <Tab icon={<RuleIcon />} iconPosition="start" label="Score Program Rule" />}
            </Tabs>
            {programRulesActing && tab===0 && ProgramRulesGroup("Program Rules acting over this Data Element",programRulesActing,true)}
            {!props.compositiveIndicator && programRulesTriggered && tab===1 && ProgramRulesGroup("Program Rules triggered by this Data Element",programRulesTriggered)}
            {props.compositiveIndicator && programRulesScore && tab===1 && ProgramRulesGroup("Score Program Rule",programRulesScore)}
            
        </Box>
    )

}
export default ProgramRulesList