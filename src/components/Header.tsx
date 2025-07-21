import React, { useState, useEffect } from 'react';
import {
  Header,
  HeaderContainer,
  HeaderName,
  HeaderNavigation,
  HeaderMenuButton,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SideNav,
  SideNavItems,
  SideNavMenuItem,
  SkipToContent,
} from '@carbon/react';
import { Menu, User, Login } from '@carbon/icons-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider';
import { useIsMobile } from '@/hooks/use-mobile';

export const AppHeader = () => {
  const { isAuthenticated, userRole } = useAuth();
  const isMobile = useIsMobile();
  const [isSideNavExpanded, setSideNavExpanded] = useState(false);
  const location = useLocation();

  // Close side navigation when route changes
  useEffect(() => {
    setSideNavExpanded(false);
  }, [location.pathname]);

  return (
    <HeaderContainer
      render={({ isSideNavExpanded, onClickSideNavExpand }) => (
        <>
          <Header aria-label="Mobiwave Platform">
            <SkipToContent />
            <HeaderMenuButton
              aria-label={isSideNavExpanded ? 'Close menu' : 'Open menu'}
              onClick={onClickSideNavExpand}
              isActive={isSideNavExpanded}
            />
            <HeaderName element={Link} to="/" prefix="">
              Mobiwave
            </HeaderName>
            
            {/* Desktop Navigation */}
            <HeaderNavigation aria-label="Mobiwave Platform">
              <HeaderMenuItem element={Link} to="/services">
                Services
              </HeaderMenuItem>
              <HeaderMenuItem element={Link} to="/pricing">
                Pricing
              </HeaderMenuItem>
              <HeaderMenuItem element={Link} to="/about">
                About
              </HeaderMenuItem>
              <HeaderMenuItem element={Link} to="/contact">
                Contact
              </HeaderMenuItem>
            </HeaderNavigation>

            {/* Global Actions */}
            <HeaderGlobalBar>
              {isAuthenticated ? (
                <>
                  <HeaderGlobalAction
                    aria-label="Dashboard"
                    tooltipAlignment="end"
                    element={Link}
                    to="/dashboard"
                  >
                    <User size={20} />
                  </HeaderGlobalAction>
                  {userRole === 'admin' && (
                    <HeaderGlobalAction
                      aria-label="Admin Portal"
                      tooltipAlignment="end"
                      element={Link}
                      to="/admin"
                    >
                      <Menu size={20} />
                    </HeaderGlobalAction>
                  )}
                </>
              ) : (
                <HeaderGlobalAction
                  aria-label="Sign In"
                  tooltipAlignment="end"
                  element={Link}
                  to="/auth"
                >
                  <Login size={20} />
                </HeaderGlobalAction>
              )}
            </HeaderGlobalBar>

            {/* Mobile Side Navigation */}
            <SideNav
              aria-label="Side navigation"
              expanded={isSideNavExpanded}
              isPersistent={false}
            >
              <SideNavItems>
                <SideNavMenuItem element={Link} to="/services">
                  Services
                </SideNavMenuItem>
                <SideNavMenuItem element={Link} to="/pricing">
                  Pricing
                </SideNavMenuItem>
                <SideNavMenuItem element={Link} to="/about">
                  About
                </SideNavMenuItem>
                <SideNavMenuItem element={Link} to="/contact">
                  Contact
                </SideNavMenuItem>
                
                {isAuthenticated ? (
                  <>
                    <SideNavMenuItem element={Link} to="/dashboard">
                      Dashboard
                    </SideNavMenuItem>
                    {userRole === 'admin' && (
                      <SideNavMenuItem element={Link} to="/admin">
                        Admin Portal
                      </SideNavMenuItem>
                    )}
                  </>
                ) : (
                  <>
                    <SideNavMenuItem element={Link} to="/auth">
                      Sign In
                    </SideNavMenuItem>
                    <SideNavMenuItem element={Link} to="/auth">
                      Get Started
                    </SideNavMenuItem>
                  </>
                )}
              </SideNavItems>
            </SideNav>
          </Header>
        </>
      )}
    />
  );
};
