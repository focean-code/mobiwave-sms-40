import React from 'react';
import { Button, Grid, Column } from '@carbon/react';
import { Link } from 'react-router-dom';
import { Login, UserFollow } from '@carbon/icons-react';

export const AuthBanner = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3">
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <div className="flex justify-between items-center">
            <span className="cds--type-body-01 font-medium">
              Access your Mobiwave messaging platform
            </span>
            <div className="flex gap-2">
              <Button
                kind="tertiary"
                size="sm"
                as={Link}
                to="/auth"
                renderIcon={Login}
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                Login
              </Button>
              <Button
                kind="primary"
                size="sm"
                as={Link}
                to="/auth"
                renderIcon={UserFollow}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </Column>
      </Grid>
    </div>
  );
};
