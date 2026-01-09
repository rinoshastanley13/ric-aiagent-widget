import React, { useState } from 'react';
import { DailyUpdatesData } from '../types';
import styles from './DailyUpdatesCard.module.css';

interface DailyUpdatesCardProps {
    data: DailyUpdatesData;
}

// Single update card component
interface UpdateCardProps {
    update: {
        id: number;
        title: string;
        effective_date: string;
        change_type: string;
        state: string;
        source_link?: string;
        description: string;
    };
}

const UpdateCard: React.FC<UpdateCardProps> = ({ update }) => {
    const [viewMore, setViewMore] = useState(false);
    const [showChanges, setShowChanges] = useState(false);

    return (
        <div className={styles.updateCard}>
            <h3 className={styles.updateTitle}>{update.title}</h3>

            <div className={styles.updateMetadata}>
                <div className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>Effective Date:</span>
                    <span className={styles.metadataValue}>{new Date(update.effective_date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    })}</span>
                </div>

                <div className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>Change Type:</span>
                    <span className={styles.metadataValue}>{update.change_type}</span>
                </div>

                <div className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>State:</span>
                    <span className={styles.metadataValue}>{update.state}</span>
                </div>

                {update.source_link && (
                    <div className={styles.metadataItem}>
                        <span className={styles.metadataLabel}>Source:</span>
                        <a
                            href={update.source_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.sourceLink}
                        >
                            View Link
                        </a>
                    </div>
                )}
            </div>

            <div className={styles.updateActions}>
                <button
                    className={`${styles.actionBtn} ${styles.viewMoreBtn}`}
                    onClick={() => {
                        setViewMore(!viewMore);
                        if (showChanges) setShowChanges(false);
                    }}
                >
                    <span className={styles.btnIcon}>{viewMore ? '▲' : '▼'}</span>
                    {viewMore ? 'View Less' : 'View More'}
                </button>

                <button
                    className={`${styles.actionBtn} ${styles.changesBtn}`}
                    onClick={() => {
                        setShowChanges(!showChanges);
                        if (viewMore) setViewMore(false);
                    }}
                >
                    <span className={styles.btnIcon}>📋</span>
                    {showChanges ? 'Hide Changes' : 'What Changed'}
                </button>
            </div>

            {viewMore && (
                <div className={styles.updateDescription}>
                    <strong>Description:</strong> {update.description}
                </div>
            )}

            {showChanges && (
                <div className={styles.changesTable}>
                    <table>
                        <thead>
                            <tr>
                                <th>Aspect</th>
                                <th>Old</th>
                                <th>New</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Status</td>
                                <td>Under Review</td>
                                <td className={styles.newValue}>Implemented</td>
                            </tr>
                            <tr>
                                <td>Effective Date</td>
                                <td>Pending</td>
                                <td className={styles.newValue}>{new Date(update.effective_date).toLocaleDateString('en-GB')}</td>
                            </tr>
                        </tbody>
                    </table>
                    <p className={styles.changesNote}>
                        Note: Specific change details would come from the update description or dedicated change tracking.
                    </p>
                </div>
            )}
        </div>
    );
};

// Category group component
interface CategoryGroupProps {
    category: string;
    count: number;
    updates: any[];
}

const CategoryGroup: React.FC<CategoryGroupProps> = ({ category, count, updates }) => {
    return (
        <div className={styles.categoryGroup}>
            <div className={styles.categoryHeader}>
                <h2 className={styles.categoryName}>{category}</h2>
                <span className={styles.categoryBadge}>{count} Update{count !== 1 ? 's' : ''}</span>
            </div>

            <div className={styles.updatesList}>
                {updates.map((update) => (
                    <UpdateCard key={update.id} update={update} />
                ))}
            </div>
        </div>
    );
};

// Main component
export const DailyUpdatesCard: React.FC<DailyUpdatesCardProps> = ({ data }) => {
    const categories = Object.values(data.grouped_by_category);

    return (
        <div className={styles.dailyUpdatesContainer}>
            {categories.map((categoryData) => (
                <CategoryGroup
                    key={categoryData.category}
                    category={categoryData.category}
                    count={categoryData.count}
                    updates={categoryData.updates}
                />
            ))}
        </div>
    );
};

export default DailyUpdatesCard;
