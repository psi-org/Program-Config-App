import { useState, useEffect } from "react"
import { useDataQuery } from "@dhis2/app-runtime";

import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import LayersClearIcon from '@mui/icons-material/LayersClear';

import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialog from './CustomMUIDialog'
import CustomMUIDialogTitle from './CustomMUIDialogTitle'
import TextField from '@mui/material/TextField';
import { IconButton } from "@mui/material";

const queryIcons = {
    results: {
        resource: 'icons',
        params: {
            fields: ['key', 'keywords', 'href']
        }
    }
};

const IconPicker = ({parentIcon, setParentIcon}) => {

    const [showModal, setShowModal] = useState(false)
    const [iconsList, setIconsList] = useState(undefined)
    const [displayIconsList, setDisplayIconsList] = useState(undefined)
    const [selectedIcon, setSelectedIcon] = useState('')

    const [iconFilterText, setIconFilterText] = useState('')
    const [iconFilter, setIconFilter] = useState('')
    const { loading, error, data, refetch: fetchIcons } = useDataQuery(queryIcons, { lazy: true });

    const filterTextChange = data => {
        setIconFilterText(data.target.value)
    }

    const displayIcons = () =>{
        setSelectedIcon(parentIcon || '')
        if(!iconsList)
            fetchIcons().then(data => {
                if (data?.results) {
                    setIconsList(data.results.sort(( a, b ) => {
                        return (a.key<b.key)?-1:((a.key>b.key)?1:0)
                    }))
                    setShowModal(true)
                }
            })
        else setShowModal(true)
    }

    useEffect(() => {
        setDisplayIconsList(iconsList)
    }, [iconsList])
    
    useEffect(() => {
        if(iconsList) filterIcons()
    }, [iconFilter, iconFilterText])

    const filterIcons = () =>{
        let newList =  iconsList.filter(icon => iconFilter===''?true:icon.key.includes(iconFilter))
        newList =  newList.filter(icon => iconFilterText===''?true:icon.key.includes(iconFilterText))
        setDisplayIconsList(newList)
    }

    const hideForm = () =>{
        setSelectedIcon('')
        setShowModal(false)
    }

    return <>
        <Button
            variant="outlined"
            size="large"
            style={{marginLeft:'1em'}}
            startIcon={<InsertEmoticonIcon />}
            onClick={() => displayIcons()}>
            ADD ICON
        </Button>
        {parentIcon &&
            <IconButton onClick={()=>setParentIcon(undefined)} color="error">
                <LayersClearIcon />
            </IconButton>
        }
        {showModal && displayIconsList && 
            <CustomMUIDialog open={true} maxWidth='lg' fullWidth={true} >
                <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => hideForm()}>
                    Select an Icon
                    <div style={{ display: 'flex',justifyContent:'space-between', alignItems: 'center', marginTop: '1em'}}>
                        <div style={{ display: 'flex', alignItems: 'center', height: '100%'}}>
                            <Button variant={iconFilter===''?'outlined':'text'} onClick={() => setIconFilter('')}> All </Button>
                            <Button variant={iconFilter==='positive'?'outlined':'text'} onClick={() => setIconFilter('positive')}> Positive </Button>
                            <Button variant={iconFilter==='negative'?'outlined':'text'} onClick={() => setIconFilter('negative')}> Negative </Button>
                            <Button variant={iconFilter==='outline'?'outlined':'text'} onClick={() => setIconFilter('outline')}> Outline </Button>
                        </div>
                        <TextField
                            autoComplete='off'
                            id="filterText"
                            sx={{ width: '30%' }}
                            label="Search for icons"
                            variant='standard'
                            value={iconFilterText}
                            onChange={filterTextChange}
                        />
                    </div>
                </CustomMUIDialogTitle >
                <DialogContent dividers style={{ padding: '1em 2em', display: 'flex', flexDirection:'column' }}>
                    <div style={{width: '100%'}}>
                        {displayIconsList.map((icon, index)=>
                            <img 
                                src={icon.href}
                                key={index}
                                onClick={() => {setSelectedIcon(icon.key)}}
                                title={icon.key.replaceAll("_", " ")}
                                width='60px'
                                height='60px'
                                style={{
                                    margin: '4px',
                                    border: selectedIcon===icon.key?'2px solid #1976d2':'2px solid transparent',
                                    cursor: 'pointer'
                                }}
                            />
                        )}
                    </div>
                </DialogContent>
                <DialogActions style={{ padding: '1em' }}>
                    <Button onClick={() => hideForm()} color="error" > Cancel </Button>
                    <Button
                        onClick={() => {setParentIcon(selectedIcon); hideForm()}}
                        variant='outlined'
                        disabled={selectedIcon===''}>
                        Select Icon
                    </Button>
                </DialogActions>
            </CustomMUIDialog>
        }
    </>
}

export default IconPicker;