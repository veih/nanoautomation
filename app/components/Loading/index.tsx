// app/components/Loading/index.tsx
"use client";

import React from 'react';
import { Card, Table, Placeholder, Row, Col } from 'react-bootstrap';

// ==================== BASE SKELETON COMPONENTS ====================
const SkeletonText = ({
    width = '100%',
    height = '1rem',
    className = ''
}: {
    width?: string | number;
    height?: string | number;
    className?: string;
}) => (
    <Placeholder as="div" animation="glow" className={className}>
        <Placeholder style={{ width, height }} className="rounded" />
    </Placeholder>
);

const SkeletonBox = ({
    width = '100%',
    height = '3rem',
    className = '',
    rounded = true
}: {
    width?: string | number;
    height?: string | number;
    className?: string;
    rounded?: boolean;
}) => (
    <Placeholder as="div" animation="glow" className={className}>
        <Placeholder
            style={{ width, height }}
            className={rounded ? 'rounded' : ''}
        />
    </Placeholder>
);

// ==================== TABLE SKELETON ====================
const TableSkeleton = ({
    rows = 5,
    columns = 4,
    showHeader = true
}: {
    rows?: number;
    columns?: number;
    showHeader?: boolean;
}) => (
    <Table striped bordered hover responsive className="shadow-sm">
        {showHeader && (
            <thead>
                <tr>
                    {Array.from({ length: columns }).map((_, index) => (
                        <th key={index}>
                            <SkeletonText width="80%" height="1.2rem" />
                        </th>
                    ))}
                </tr>
            </thead>
        )}
        <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <td key={colIndex}>
                            <SkeletonText
                                width={colIndex === 0 ? '60%' : colIndex === columns - 1 ? '120px' : '80%'}
                                height="1rem"
                            />
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    </Table>
);

// ==================== CARD SKELETON ====================
const CardSkeleton = ({
    showImage = false,
    imageHeight = '200px',
    showFooter = false
}: {
    showImage?: boolean;
    imageHeight?: string;
    showFooter?: boolean;
}) => (
    <Card className="h-100 shadow-sm">
        {showImage && (
            <SkeletonBox width="100%" height={imageHeight} className="card-img-top" rounded={false} />
        )}
        <Card.Body>
            <SkeletonText width="70%" height="1.5rem" className="mb-3" />
            <SkeletonText width="100%" height="1rem" className="mb-2" />
            <SkeletonText width="90%" height="1rem" className="mb-2" />
            <SkeletonText width="60%" height="1rem" className="mb-3" />
            <SkeletonBox width="100px" height="2.5rem" />
        </Card.Body>
        {showFooter && (
            <Card.Footer>
                <SkeletonText width="50%" height="0.875rem" />
            </Card.Footer>
        )}
    </Card>
);

// ==================== DASHBOARD CARD SKELETON ====================
const DashboardCardSkeleton = () => (
    <Card className="h-100 shadow-sm">
        <Card.Body className="text-center">
            <SkeletonBox width="60px" height="60px" className="mx-auto mb-3" />
            <SkeletonText width="80%" height="1.5rem" className="mb-2" />
            <SkeletonText width="60%" height="2rem" className="mb-2" />
            <SkeletonText width="40%" height="1rem" />
        </Card.Body>
    </Card>
);

// ==================== FORM SKELETON ====================
const FormSkeleton = ({
    fields = 3,
    showButtons = true
}: {
    fields?: number;
    showButtons?: boolean;
}) => (
    <div>
        {Array.from({ length: fields }).map((_, index) => (
            <div key={index} className="mb-3">
                <SkeletonText width="30%" height="1rem" className="mb-2" />
                <SkeletonBox width="100%" height="2.5rem" />
            </div>
        ))}
        {showButtons && (
            <div className="d-flex gap-2 mt-4">
                <SkeletonBox width="100px" height="2.5rem" />
                <SkeletonBox width="80px" height="2.5rem" />
            </div>
        )}
    </div>
);

// ==================== CMS SPECIFIC SKELETONS ====================
const CmsTableSkeleton = () => (
    <div className="container">
        {/* Header Skeleton */}
        <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
            <SkeletonText width="300px" height="2rem" />
            <SkeletonBox width="120px" height="2.5rem" />
        </div>

        {/* Table Skeleton */}
        <TableSkeleton
            rows={5}
            columns={4}
            showHeader={true}
        />
    </div>
);

const CmsCardGridSkeleton = ({ count = 6 }: { count?: number }) => (
    <Row>
        {Array.from({ length: count }).map((_, index) => (
            <Col key={index} md={6} lg={4} className="mb-4">
                <CardSkeleton showImage={true} imageHeight="150px" />
            </Col>
        ))}
    </Row>
);

// ==================== EQUIPMENT DETAILS SKELETON ====================
const EquipmentDetailsSkeleton = () => (
    <div>
        <div className="mb-4">
            <SkeletonText width="200px" height="1.5rem" className="mb-2" />
            <SkeletonText width="100%" height="1rem" className="mb-1" />
            <SkeletonText width="80%" height="1rem" />
        </div>

        <Row>
            <Col md={6}>
                <h6>Atuadores</h6>
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="border rounded p-2 mb-2">
                        <SkeletonText width="60%" height="1rem" className="mb-1" />
                        <SkeletonText width="40%" height="0.875rem" />
                    </div>
                ))}
            </Col>
            <Col md={6}>
                <h6>Sensores</h6>
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="border rounded p-2 mb-2">
                        <SkeletonText width="60%" height="1rem" className="mb-1" />
                        <SkeletonText width="40%" height="0.875rem" />
                    </div>
                ))}
            </Col>
        </Row>
    </div>
);

// ==================== NAVIGATION SKELETON ====================
const NavigationSkeleton = () => (
    <div className="bg-dark text-white p-3">
        <SkeletonText width="80%" height="1.25rem" className="mb-4" />
        {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="mb-2">
                <SkeletonText width="90%" height="1rem" />
            </div>
        ))}
    </div>
);

// ==================== STATS CARDS SKELETON ====================
const StatsCardsSkeleton = ({ count = 4 }: { count?: number }) => (
    <Row className="mb-4">
        {Array.from({ length: count }).map((_, index) => (
            <Col key={index} md={6} lg={3} className="mb-3">
                <DashboardCardSkeleton />
            </Col>
        ))}
    </Row>
);

// ==================== MAINTENANCE TIMELINE SKELETON ====================
const MaintenanceTimelineSkeleton = () => (
    <div>
        {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="border-start border-3 border-primary ps-3 mb-4">
                <SkeletonText width="30%" height="0.875rem" className="mb-1" />
                <SkeletonText width="70%" height="1.2rem" className="mb-2" />
                <SkeletonText width="100%" height="1rem" className="mb-1" />
                <SkeletonText width="85%" height="1rem" />
            </div>
        ))}
    </div>
);

// ==================== FULL PAGE LOADING ====================
const FullPageLoading = ({ message = 'Carregando...' }: { message?: string }) => (
    <div className="d-flex flex-column justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">{message}</p>
    </div>
);

// ==================== EXPORT ALL ====================
export {
    // Base components
    SkeletonText,
    SkeletonBox,

    // Generic skeletons
    TableSkeleton,
    CardSkeleton,
    DashboardCardSkeleton,
    FormSkeleton,

    // Specific skeletons
    CmsTableSkeleton,
    CmsCardGridSkeleton,
    EquipmentDetailsSkeleton,
    NavigationSkeleton,
    StatsCardsSkeleton,
    MaintenanceTimelineSkeleton,

    // Utility
    FullPageLoading
};