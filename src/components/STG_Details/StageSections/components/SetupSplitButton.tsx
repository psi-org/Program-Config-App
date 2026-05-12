import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ConstructionIcon from '@mui/icons-material/Construction';
import InsightsIcon from '@mui/icons-material/Insights';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import React from 'react';

export const SETUP_OPTIONS = [
  'SET UP PROGRAM',
  'ENABLE IN-APP ANALYTICS',
] as const;

interface SetupSplitButtonProps {
  open: boolean;
  allAuth: boolean;
  savedAndValidated: boolean;
  selectedIndex: number;
  anchorRef: React.RefObject<HTMLDivElement>;
  onMainClick: () => void;
  onToggle: () => void;
  onClose: (event: Event | React.SyntheticEvent) => void;
  onMenuItemClick: (index: number) => void;
}

const SetupSplitButton = ({
  open,
  allAuth,
  savedAndValidated,
  selectedIndex,
  anchorRef,
  onMainClick,
  onToggle,
  onClose,
  onMenuItemClick,
}: SetupSplitButtonProps) => (
  <>
    <ButtonGroup
      disableElevation
      color="primary"
      variant="contained"
      ref={anchorRef}
      aria-label="split button"
    >
      <Button
        onClick={onMainClick}
        startIcon={
          selectedIndex === 0 ? <ConstructionIcon /> : <InsightsIcon />
        }
        size="small"
        disabled={!savedAndValidated}
      >
        {SETUP_OPTIONS[selectedIndex]}
      </Button>
      {allAuth && (
        <Button
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={onToggle}
          disabled={!savedAndValidated}
        >
          <ArrowDropDownIcon />
        </Button>
      )}
    </ButtonGroup>
    <Popper
      sx={{ zIndex: 1 }}
      open={open}
      anchorEl={anchorRef.current}
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
            <ClickAwayListener onClickAway={onClose}>
              <MenuList id="split-button-menu" autoFocusItem>
                {SETUP_OPTIONS.map((option, index) => (
                  <MenuItem
                    key={option}
                    disabled={index === 1}
                    selected={index === selectedIndex}
                    onClick={() => onMenuItemClick(index)}
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
);

export default SetupSplitButton;
