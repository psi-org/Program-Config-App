import React, { useState, useEffect, useRef } from 'react'
import { LoadingButton } from '@mui/lab';
import { Button, ButtonGroup, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper } from '@mui/material';
import PublishIcon from '@mui/icons-material/Publish';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const optionsTemplate = ['IMPORT TEMPLATE', 'DOWNLOAD TEMPLATE'];

const ImportDownloadButton = ({value, setValue, disabled = false, setImporterEnabled, setExportToExcel, size='regular'}) => {

    const anchorRefTemplate = useRef(null);
    const [openTemplateBtn, setOpenTemplateBtn] = useState(false);

    const handleMenuItemClickTemplate = (event, index) => {
        setValue(index);
        setOpenTemplateBtn(false);
    };

    const handleToggleTemplate = () => {
        setOpenTemplateBtn((prevOpen) => !prevOpen);
    };

    const handleCloseTemplate = (event) => {
        if (anchorRefTemplate.current && anchorRefTemplate.current.contains(event.target)) {
            return;
        }

        setOpenTemplateBtn(false);
    };

    const handleClickTemplate = (event) => {
        switch (value) {
            case 0:
                setImporterEnabled(true)
                break;
            case 1:
                configuration_download(event)
                break;
            default:
                break;
        }
    };

    const configuration_download = (e) => {
        e.preventDefault();
        setExportToExcel(true);
    };

    return (
        <>
            <ButtonGroup disableElevation ref={anchorRefTemplate} aria-label="split button">
                <LoadingButton
                    onClick={handleClickTemplate}
                    startIcon={value === 1 ? <FileDownloadIcon /> : <PublishIcon />}
                    size={ size }
                    variant="contained"
                    color="success"
                    disabled={disabled}
                    loadingPosition="start"
                    loading={disabled}
                >{optionsTemplate[value]}</LoadingButton>
                <Button
                    size={ size }
                    variant="contained"
                    color="success"
                    aria-controls={openTemplateBtn ? 'split-button-menu' : undefined}
                    aria-expanded={openTemplateBtn ? 'true' : undefined}
                    aria-label="select merge strategy"
                    aria-haspopup="menu"
                    disabled={disabled}
                    onClick={handleToggleTemplate}
                >
                    <ArrowDropDownIcon />
                </Button>
            </ButtonGroup>
            <Popper
                sx={{
                    zIndex: 1
                }}

                open={openTemplateBtn}
                anchorEl={anchorRefTemplate.current}
                role={undefined}
                transition
                disablePortal
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin:
                                placement === 'bottom' ? 'center top' : 'center bottom',
                        }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleCloseTemplate}>
                                <MenuList id="split-button-menu" autoFocusItem>
                                    {optionsTemplate.map((option, index) => (
                                        <MenuItem
                                            key={option}
                                            selected={index === value}
                                            onClick={(event) => handleMenuItemClickTemplate(event, index)}
                                        >
                                            {option}
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    )
}

export default ImportDownloadButton
