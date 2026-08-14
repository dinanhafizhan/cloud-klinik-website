import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import LoadingSpinner from '../utils/LoadingSpinner';
import { FaPlus, FaEdit, FaTrashAlt, FaSearch } from "react-icons/fa";
import SidebarContext from "../SidebarContext";

const JanjiList = () => {
  const [janji, setJanji] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const { toggleSidebar } = useContext(SidebarContext);

  // --- NEW STATES FOR MODAL ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [janjiToDeleteId, setJanjiToDeleteId] = useState(null);
  // --- END NEW STATES ---

  useEffect(() => {
    fetchJanji();
  }, []);

  const fetchJanji = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/janji`);
      const processedJanji = res.data.map(item => {
        if (item.user && item.user.foto && !item.user.foto.startsWith('http')) {
          item.user.foto = `${process.env.REACT_APP_API_URL}/images/${item.user.foto}`;
        }
        if (item.dokter && item.dokter.foto && !item.dokter.foto.startsWith('http')) {
          item.dokter.foto = `${process.env.REACT_APP_API_URL}/images/${item.dokter.foto}`;
        }
        return item;
      });
      setJanji(processedJanji);
    } catch (err) {
      console.error("Error fetching janji:", err);
      alert("Gagal memuat data janji.");
    } finally {
      setLoading(false);
    }
  };

  // --- MODAL HANDLERS ---
  const handleDeleteClick = (id) => {
    setJanjiToDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (janjiToDeleteId) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/janji/${janjiToDeleteId}`);
        fetchJanji();
        setShowDeleteModal(false); // Close modal on success
        setJanjiToDeleteId(null);
      } catch (err) {
        console.error("Error deleting janji:", err);
        alert("Gagal menghapus janji.");
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setJanjiToDeleteId(null);
  };
  // --- END MODAL HANDLERS ---

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/janji/${id}`, { status: newStatus });
      fetchJanji();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Gagal mengupdate status janji.");
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredJanji = janji.filter(item => {
    const query = searchTerm.toLowerCase();
    const patientName = item.user?.nama?.toLowerCase() || '';
    const phoneNumber = item.user?.no_tlp?.toLowerCase() || '';
    const spesialis = item.dokter?.spesialis?.toLowerCase() || '';
    const doctorName = item.dokter?.nama?.toLowerCase() || '';
    const schedule = item.jadwal ? `${item.jadwal.hari} ${item.jadwal.waktu}`.toLowerCase() : '';
    const status = item.status?.toLowerCase() || '';
    const tanggal = item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID').toLowerCase() : ''; // Add tanggal to search filter

    return (
      patientName.includes(query) ||
      phoneNumber.includes(query) ||
      spesialis.includes(query) ||
      doctorName.includes(query) ||
      schedule.includes(query) ||
      status.includes(query) ||
      tanggal.includes(query) // Include tanggal in search
    );
  });

  const handleRowSelect = (id) => {
    setSelectedRows(prevSelected =>
      prevSelected.includes(id)
        ? prevSelected.filter(rowId => rowId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSelectAllRows = (e) => {
    if (e.target.checked) {
      setSelectedRows(filteredJanji.map(item => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  const getDropdownStyle = (status) => {
    let bgColor, textColor, borderColor;
    switch (status?.toLowerCase()) {
      case 'pending':
        bgColor = '#FFFDD0';
        textColor = '#B76E00';
        borderColor = '#B76E00';
        break;
      case 'approved':
        bgColor = '#D4EDDA';
        textColor = '#28A745';
        borderColor = '#28A745';
        break;
      case 'rejected':
        bgColor = '#F8D7DA';
        textColor = '#DC3545';
        borderColor = '#DC3545';
        break;
      default:
        bgColor = '#E2E6EA';
        textColor = '#6C757D';
        borderColor = '#6C757D';
    }

    return {
      selectContainer: {
        backgroundColor: bgColor,
        borderRadius: '5px',
        border: `1px solid ${borderColor}`,
        boxShadow: `0 0 0 1px ${borderColor}`,
        overflow: 'hidden',
      },
      selectElement: {
        color: textColor,
        fontWeight: 'bold',
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: 'none',
        width: '100%',
        height: '100%',
        paddingLeft: '10px',
        paddingRight: '2.25em',
        appearance: 'none',
        cursor: 'pointer',
      },
      optionElement: {
        color: 'black',
        backgroundColor: 'white',
      }
    };
  };

  return (
    <div style={styles.container}>
      <div style={styles.titleWithToggle}>
        <button
          onClick={toggleSidebar}
          style={styles.toggleButton}
          title="Toggle Sidebar"
        >
          ☰
        </button>
        <h2 style={styles.pageTitle}>Daftar Janji Temu</h2>
      </div>

      <div style={styles.headerContainer}>
        <div style={styles.searchAndActions}>
          <div style={styles.searchInputContainer}>
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={styles.searchInput}
            />
            <FaSearch style={styles.searchIcon} />
          </div>
          <Link to="./add" style={styles.addJanjiButton}>
            <FaPlus style={{ marginRight: '8px' }} /> Tambah Janji Temu
          </Link>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Memuat data janji temu..." />
      ) : (
        <div style={styles.tableBox}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.tableHeaderCheckbox}>
                  <input
                    type="checkbox"
                    onChange={handleSelectAllRows}
                    checked={selectedRows.length === filteredJanji.length && filteredJanji.length > 0}
                  />
                </th>
                <th style={styles.tableHeaderCell}>Nama Pasien</th>
                <th style={styles.tableHeaderCell}>No. Telepon</th>
                <th style={styles.tableHeaderCell}>Spesialis</th>
                <th style={styles.tableHeaderCell}>Nama Dokter</th>
                <th style={styles.tableHeaderCell}>Jadwal</th>
                <th style={styles.tableHeaderCell}>Tanggal</th> {/* NEW: Tanggal Header */}
                <th style={styles.tableHeaderCell}>Status</th>
                <th style={styles.tableHeaderCell}>Dibuat</th>
                <th style={styles.tableHeaderCell}>Diperbarui</th>
                <th style={styles.tableHeaderCellLast}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredJanji.length === 0 ? (
                <tr>
                  <td colSpan="11" style={styles.noDataRow}> {/* Changed colspan to 11 */}
                    Tidak ada data Janji Temu.
                  </td>
                </tr>
              ) : (
                filteredJanji.map((item) => {
                  const dropdownStyles = getDropdownStyle(item.status);
                  const userPhotoUrl = item.user?.foto;
                  const userInitial = item.user?.nama ? item.user.nama.charAt(0).toUpperCase() : 'U';

                  return (
                    <tr
                      key={item.id}
                      style={selectedRows.includes(item.id) ? styles.selectedTableRow : styles.tableRow}
                    >
                      <td style={styles.tableCellCheckbox}>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(item.id)}
                          onChange={() => handleRowSelect(item.id)}
                        />
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.avatarCell}>
                          {userPhotoUrl ? (
                            <img
                              src={userPhotoUrl}
                              alt={item.user?.nama || 'User Avatar'}
                              style={styles.avatarImage}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                const fallbackDiv = document.createElement('div');
                                fallbackDiv.textContent = userInitial;
                                Object.assign(fallbackDiv.style, styles.avatarPlaceholder);
                                if (e.target.parentNode) {
                                      e.target.parentNode.insertBefore(fallbackDiv, e.target.nextSibling);
                                }
                              }}
                            />
                          ) : (
                            <div style={styles.avatarPlaceholder}>
                              {userInitial}
                            </div>
                          )}
                          {item.user?.nama || 'N/A'}
                        </div>
                      </td>
                      <td style={styles.tableCell}>{item.user?.no_tlp || 'N/A'}</td>
                      <td style={styles.tableCell}>{item.dokter?.spesialis || 'N/A'}</td>
                      <td style={styles.tableCell}>{item.dokter?.nama || 'N/A'}</td>
                      <td style={styles.tableCell}>
                        {item.jadwal ? `${item.jadwal.hari} (${item.jadwal.waktu})` : 'N/A'}
                      </td>
                      <td style={styles.tableCell}>
                        {item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : 'N/A'} {/* NEW: Tanggal Cell */}
                      </td>
                      <td style={styles.tableCell}>
                        <div className="select is-small is-rounded" style={dropdownStyles.selectContainer}>
                          <select
                            value={item.status}
                            onChange={(e) => updateStatus(item.id, e.target.value)}
                            style={dropdownStyles.selectElement}
                          >
                            <option value="pending" style={dropdownStyles.optionElement}>Pending</option>
                            <option value="approved" style={dropdownStyles.optionElement}>Approved</option>
                            <option value="rejected" style={dropdownStyles.optionElement}>Rejected</option>
                          </select>
                        </div>
                      </td>
                      <td style={styles.tableCell}>{new Date(item.createdAt).toLocaleDateString('id-ID')}</td>
                      <td style={styles.tableCell}>{new Date(item.updatedAt).toLocaleDateString('id-ID')}</td>
                      <td style={styles.tableCellActions}>
                        <Link
                          to={`./edit/${item.id}`}
                          style={styles.actionButtonSmall}
                          title="Edit"
                        >
                          <FaEdit size={14} />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(item.id)}
                          style={{ ...styles.actionButtonSmall, ...styles.deleteButton }}
                          title="Hapus"
                        >
                          <FaTrashAlt size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {showDeleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <p style={styles.modalText}>Yakin ingin menghapus janji ini?</p>
            <div style={styles.modalButtons}>
              <button
                onClick={handleConfirmDelete}
                style={styles.modalConfirmButton}
              >
                Ya, Hapus!
              </button>
              <button
                onClick={handleCancelDelete}
                style={styles.modalCancelButton}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- END DELETE CONFIRMATION MODAL --- */}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  titleWithToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  pageTitle: {
    fontSize: '1.8em',
    fontWeight: '600',
    color: '#333',
    textAlign: 'left',
  },
  headerContainer: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
    padding: '15px 20px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
  },
  searchAndActions: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  searchInputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchInput: {
    padding: '10px 15px',
    paddingRight: '40px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '0.95em',
    width: '280px',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  searchIcon: {
    position: 'absolute',
    right: '15px',
    color: '#888',
  },
  addJanjiButton: {
    backgroundColor: '#6A1B9A',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 18px',
    fontSize: '0.95em',
    fontWeight: 'bold',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    boxShadow: '0 4px 8px rgba(106, 27, 154, 0.2)',
    transition: 'background-color 0.2s ease',
  },
  loadingProgress: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '1.2em',
    color: '#666',
  },
  tableBox: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0',
  },
  tableHeaderRow: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #eee',
    height: '60px',
    fontSize: '0.9em',
    color: '#333',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  tableHeaderCheckbox: {
    padding: '15px 15px',
    width: '40px',
    textAlign: 'center',
    color: '#333',
  },
  tableHeaderCell: {
    padding: '15px 20px',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: '#333',
  },
  tableHeaderCellLast: {
    padding: '15px 20px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    color: '#333',
  },
  tableRow: {
    borderBottom: '1px solid #eee',
    transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
    height: '70px',
  },
  selectedTableRow: {
    backgroundColor: '#FFFBE6',
    borderBottom: '1px solid #eee',
    boxShadow: '0 0 10px rgba(255, 204, 0, 0.1)',
    cursor: 'pointer',
    height: '70px',
  },
  tableCell: {
    padding: '12px 20px',
    color: '#333',
    fontSize: '0.95em',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tableCellCheckbox: {
    padding: '12px 15px',
    textAlign: 'center',
    verticalAlign: 'middle',
  },
  avatarCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatarImage: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover',
    flexShrink: 0,
  },
  avatarPlaceholder: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#D1C4E9',
    color: '#5E35B1',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: '1.1em',
    flexShrink: 0,
  },
  noDataRow: {
    textAlign: 'center',
    padding: '30px',
    color: '#999',
    fontSize: '1.1em',
  },
  tableCellActions: {
    textAlign: 'center',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
  },
  actionButtonSmall: {
    backgroundColor: '#E0E0E0',
    color: '#555',
    border: 'none',
    borderRadius: '6px',
    padding: '8px',
    fontSize: '0.85em',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease',
    margin: '0 4px',
    width: '32px',
    height: '32px',
    textDecoration: 'none',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
    color: '#EF5350',
  },
  headerBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  toggleButton: {
    fontSize: '20px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#333',
  },

  // --- NEW STYLES FOR MODAL ---
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.3s forwards', // Fade-in effect
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    maxWidth: '400px',
    width: '90%',
    transform: 'scale(0.9)', // Initial scale for pop-in effect
    animation: 'scaleIn 0.3s forwards', // Scale-in effect
    border: '2px solid #6A1B9A', // Border color matching theme
    position: 'relative', // Needed for pseudo-elements or specific z-index
  },
  modalText: {
    fontSize: '1.2em',
    marginBottom: '25px',
    color: '#333',
    fontWeight: '500',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
  },
  modalConfirmButton: {
    backgroundColor: '#DC3545', // Merah untuk konfirmasi hapus
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 25px',
    fontSize: '1em',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, transform 0.1s ease',
    boxShadow: '0 4px 8px rgba(220, 53, 69, 0.2)',
  },
  modalCancelButton: {
    backgroundColor: '#6C757D', // Abu-abu untuk batal
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 25px',
    fontSize: '1em',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, transform 0.1s ease',
    boxShadow: '0 4px 8px rgba(108, 117, 125, 0.2)',
  },
};

export default JanjiList;