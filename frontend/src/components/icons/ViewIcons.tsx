import { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

/**
 * Board view icon - Kanban board layout
 * Extracted from Figma design
 */
export function BoardIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M3.88198 20.063C2.49391 18.6748 2.49391 16.4407 2.49391 11.9726C2.49391 7.50451 2.49391 5.27045 3.88198 3.88237C5.27005 2.4943 7.50413 2.4943 11.9723 2.4943C16.4404 2.4943 18.6745 2.4943 20.0626 3.88237C21.4506 5.27044 21.4506 7.50451 21.4506 11.9726C21.4506 16.4407 21.4506 18.6748 20.0626 20.063C18.6745 21.451 16.4404 21.451 11.9723 21.451C7.50413 21.451 5.27006 21.451 3.88198 20.063Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M2.49391 8.97949H21.4506" stroke="currentColor" strokeWidth="1" />
      <path d="M15.9632 21.451V2.4943" stroke="currentColor" strokeWidth="1" />
      <path d="M7.98216 21.4508V2.49406" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/**
 * List view icon - Horizontal lines layout
 * Extracted from Figma design
 */
export function ListIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M7.98216 4.98861H19.9548"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M3.9905 4.98861H3.99901"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.9905 11.9727H3.99901"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.9905 18.9567H3.99901"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.98216 11.9727H19.9548"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M7.98216 18.9567H19.9548"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Grid view icon - 2x2 grid layout
 * Extracted from Figma design
 */
export function GridIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M3.88 9.64092C4.3833 9.97721 5.08393 9.97721 6.48519 9.97721C7.88646 9.97721 8.58709 9.97721 9.09039 9.64092C9.30827 9.49533 9.49534 9.30826 9.64092 9.09038C9.97721 8.58708 9.97721 7.88645 9.97721 6.48519C9.97721 5.08393 9.97721 4.3833 9.64092 3.88C9.49534 3.66212 9.30827 3.47504 9.09039 3.32946C8.58709 2.99316 7.88646 2.99316 6.48519 2.99316C5.08393 2.99316 4.3833 2.99316 3.88 3.32946C3.66212 3.47504 3.47504 3.66212 3.32947 3.88C2.99316 4.3833 2.99316 5.08393 2.99316 6.48519C2.99316 7.88645 2.99316 8.58708 3.32947 9.09038C3.47504 9.30826 3.66212 9.49533 3.88 9.64092Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M14.8553 9.64092C15.3586 9.97721 16.0592 9.97721 17.4605 9.97721C18.8617 9.97721 19.5624 9.97721 20.0657 9.64092C20.2836 9.49533 20.4706 9.30826 20.6162 9.09038C20.9525 8.58708 20.9525 7.88645 20.9525 6.48519C20.9525 5.08393 20.9525 4.3833 20.6162 3.88C20.4706 3.66212 20.2836 3.47504 20.0657 3.32946C19.5624 2.99316 18.8617 2.99316 17.4605 2.99316C16.0592 2.99316 15.3586 2.99316 14.8553 3.32946C14.6375 3.47504 14.4504 3.66212 14.3047 3.88C13.9685 4.3833 13.9685 5.08393 13.9685 6.48519C13.9685 7.88645 13.9685 8.58708 14.3047 9.09038C14.4504 9.30826 14.6375 9.49533 14.8553 9.64092Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M3.88 20.6158C4.3833 20.9522 5.08393 20.9522 6.48519 20.9522C7.88646 20.9522 8.58709 20.9522 9.09039 20.6158C9.30827 20.4703 9.49534 20.2832 9.64092 20.0653C9.97721 19.562 9.97721 18.8614 9.97721 17.4601C9.97721 16.0588 9.97721 15.3582 9.64092 14.855C9.49534 14.6371 9.30827 14.45 9.09039 14.3044C8.58709 13.9681 7.88646 13.9681 6.48519 13.9681C5.08393 13.9681 4.3833 13.9681 3.88 14.3044C3.66212 14.45 3.47504 14.6371 3.32947 14.855C2.99316 15.3582 2.99316 16.0588 2.99316 17.4601C2.99316 18.8614 2.99316 19.562 3.32947 20.0653C3.47504 20.2832 3.66212 20.4703 3.88 20.6158Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M14.8553 20.6158C15.3586 20.9522 16.0592 20.9522 17.4605 20.9522C18.8617 20.9522 19.5624 20.9522 20.0657 20.6158C20.2836 20.4703 20.4706 20.2832 20.6162 20.0653C20.9525 19.562 20.9525 18.8614 20.9525 17.4601C20.9525 16.0588 20.9525 15.3582 20.6162 14.855C20.4706 14.6371 20.2836 14.45 20.0657 14.3044C19.5624 13.9681 18.8617 13.9681 17.4605 13.9681C16.0592 13.9681 15.3586 13.9681 14.8553 14.3044C14.6375 14.45 14.4504 14.6371 14.3047 14.855C13.9685 15.3582 13.9685 16.0588 13.9685 17.4601C13.9685 18.8614 13.9685 19.562 14.3047 20.0653C14.4504 20.2832 14.6375 20.4703 14.8553 20.6158Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Search status icon - Magnifying glass with status lines
 * Extracted from Figma design
 */
export function SearchStatusIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M19.9544 10.9749C19.9544 15.9336 15.9336 19.9544 10.9749 19.9544C6.01626 19.9544 1.99544 15.9336 1.99544 10.9749C1.99544 6.01626 6.01626 1.99544 10.9749 1.99544"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.8873 20.6427C19.4161 22.239 20.6233 22.3987 21.5512 21.0018C22.3993 19.7248 21.8405 18.6772 20.304 18.6772C19.1666 18.6672 18.5281 19.5551 18.8873 20.6427Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.9681 4.98861H19.9544"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.9681 7.98177H16.9613"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Filter funnel icon
 * Extracted from Figma design
 */
export function FilterFunnelIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M8.83728 12.4776C6.3545 10.6213 4.58517 8.57956 3.61908 7.4317C3.32002 7.07637 3.22202 6.81633 3.16311 6.35828C2.96135 4.78986 2.86048 4.00565 3.32037 3.49941C3.78027 2.99316 4.59355 2.99316 6.22013 2.99316H17.7252C19.3518 2.99316 20.165 2.99316 20.6249 3.49941C21.0848 4.00565 20.984 4.78986 20.7822 6.35829C20.7233 6.81634 20.6253 7.07638 20.3262 7.4317C19.3588 8.58102 17.5859 10.6264 15.0981 12.485C14.873 12.6532 14.7247 12.9272 14.6971 13.2312C14.4507 15.9556 14.2234 17.4478 14.0819 18.2026C13.8537 19.4213 12.1255 20.1546 11.2004 20.8088C10.6498 21.1982 9.98151 20.7346 9.91015 20.1318C9.77411 18.9827 9.51787 16.6484 9.23817 13.2312C9.21305 12.9244 9.06416 12.6472 8.83728 12.4776Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Tag/Label icon for Manage Tags button
 * Extracted from Figma design
 */
export function TagLabelIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M17.4597 4.98885C18.2863 4.98885 18.9563 5.65889 18.9563 6.48543C18.9563 7.31197 18.2863 7.98201 17.4597 7.98201C16.6332 7.98201 15.9632 7.31197 15.9632 6.48543C15.9632 5.65889 16.6332 4.98885 17.4597 4.98885Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.7683 11.1185C1.76744 12.2364 1.74591 13.9228 2.66447 15.1092C4.48726 17.4634 6.48233 19.4585 8.83654 21.2812C10.0229 22.1998 11.7094 22.1782 12.8272 21.1774C15.8621 18.46 18.6413 15.6202 21.3236 12.4994C21.5888 12.1909 21.7546 11.8127 21.7918 11.4075C21.9564 9.61602 22.2947 4.45449 20.893 3.05276C19.4912 1.65104 14.3297 1.98922 12.5382 2.15384C12.133 2.19107 11.7548 2.35694 11.4463 2.62212C8.3255 5.30434 5.48568 8.08365 2.7683 11.1185Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M6.98366 13.9683L9.9768 16.9615"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Plus icon for New Task button
 * Extracted from Figma design
 */
export function PlusTaskIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M12 4V20M20 12H4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
