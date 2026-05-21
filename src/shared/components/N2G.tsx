// N2G — icon wrapper backed by Font Awesome 6 Free Solid
// API is name-string based for backward compat; callers don't need to change.

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faPlus, faXmark, faChevronDown, faChevronRight, faMoon, faCheck,
  faFont, faAlignLeft, faHashtag, faTrash, faDownload, faUpload,
  faCloudArrowUp, faCircleCheck, faMagnifyingGlass, faShareNodes,
  faLock, faEye, faSun, faMap, faKeyboard, faCircleInfo, faCircle,
  faFilePlus, faPencil, faRotateLeft, faRotateRight, faScissors,
  faCopy, faPaste, faCode, faGear, faBell, faArrowRightFromBracket,
  faFolderOpen, faWandMagicSparkles, faCompress, faHardDrive,
  faCloud, faSliders, faAlignJustify, faEllipsis, faFile,
} from '@fortawesome/free-solid-svg-icons'

export interface N2GProps {
  name:       string
  size?:      number    // px — default 16
  stroke?:    number    // ignored (FA solid icons are filled)
  color?:     string    // default 'currentColor'
  className?: string
}

const ICONS: Record<string, IconDefinition> = {
  // actions
  'plus':                   faPlus,
  'x':                      faXmark,
  'check':                  faCheck,
  'trash':                  faTrash,
  'download':               faDownload,
  'upload':                 faUpload,
  'copy':                   faCopy,
  'paste':                  faPaste,
  'cut':                    faScissors,
  'undo':                   faRotateLeft,
  'redo':                   faRotateRight,
  'rename':                 faPencil,
  'minimize':               faCompress,
  // navigation / chevrons
  'chev-down':              faChevronDown,
  'chev-right':             faChevronRight,
  // theme
  'moon':                   faMoon,
  'sun':                    faSun,
  // text / format
  'type':                   faFont,
  'wrap':                   faAlignJustify,
  'hash':                   faHashtag,
  'comment':                faCode,
  'format':                 faWandMagicSparkles,
  // files / cloud
  'file-new':               faFilePlus,
  'folder-open':            faFolderOpen,
  'cloud-check':            faCircleCheck,
  'cloud-up':               faCloudArrowUp,
  'cloud-upload':           faCloudArrowUp,
  'hard-drive':             faHardDrive,
  // communication / ui
  'search':                 faMagnifyingGlass,
  'share':                  faShareNodes,
  'lock':                   faLock,
  'eye':                    faEye,
  'bell':                   faBell,
  'info':                   faCircleInfo,
  'dot':                    faCircle,
  'map':                    faMap,
  'keyboard':               faKeyboard,
  // system
  'settings':               faGear,
  'log-out':                faArrowRightFromBracket,
  'sliders':                faSliders,
  'ellipsis':               faEllipsis,
  'file':                   faFile,
  'cloud':                  faCloud,
  // compat aliases
  'align-left':             faAlignLeft,
}

export function N2G({
  name,
  size  = 16,
  color = 'currentColor',
  className,
}: N2GProps) {
  const icon = ICONS[name]
  if (!icon) return null

  return (
    <FontAwesomeIcon
      icon={icon}
      style={{ width: size, height: size, color, flexShrink: 0 }}
      className={className}
    />
  )
}
