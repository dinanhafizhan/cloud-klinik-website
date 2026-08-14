import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import LoadingSpinner from '../utils/LoadingSpinner';
import { FaPlus, FaEdit, FaTrashAlt, FaEye, FaEyeSlash, FaSearch } from "react-icons/fa";
import SidebarContext from "../SidebarContext"; // Import SidebarContext

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordMap, setShowPasswordMap] = useState({}); // State untuk show/hide password
  const [searchTerm, setSearchTerm] = useState(''); // State untuk pencarian
  const { toggleSidebar } = useContext(SidebarContext); // Gunakan SidebarContext

  // --- NEW STATES FOR MODAL ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState(null);
  // --- END NEW STATES ---

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/users`);
      // Proses URL foto user
      const processedUsers = res.data.map(user => {
        if (user.foto && !user.foto.startsWith('http')) {
          user.foto = `${process.env.REACT_APP_API_URL}/images/${user.foto}`;
        }
        return user;
      });
      setUsers(processedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      alert("Gagal memuat data user.");
    } finally {
      setLoading(false);
    }
  };

  // --- MODAL HANDLERS ---
  const handleDeleteClick = (id) => {
    setUserToDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDeleteId) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/users/${userToDeleteId}`);
        getUsers(); // Refresh list
        setShowDeleteModal(false); // Close modal on success
        setUserToDeleteId(null);
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("Gagal menghapus user.");
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDeleteId(null);
  };
  // --- END MODAL HANDLERS ---

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user => {
    const query = searchTerm.toLowerCase();
    const nama = user.nama?.toLowerCase() || '';
    const email = user.email?.toLowerCase() || '';
    const gender = user.gender?.toLowerCase() || '';
    const alamat = user.alamat?.toLowerCase() || '';
    const noTlp = user.no_tlp?.toLowerCase() || '';

    return (
      nama.includes(query) ||
      email.includes(query) ||
      gender.includes(query) ||
      alamat.includes(query) ||
      noTlp.includes(query)
    );
  });

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
        <h2 style={styles.pageTitle}>Daftar User</h2>
      </div>

      <div style={styles.headerContainer}>
        <div style={styles.searchAndActions}>
          <div style={styles.searchInputContainer}>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={styles.searchInput}
            />
            <FaSearch style={styles.searchIcon} />
          </div>
          <Link to="/admin/user/add" style={styles.addDokterButton}> {/* Ubah to="/admin/user/add" */}
            <FaPlus style={{ marginRight: '8px' }} /> Tambah User
          </Link>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Memuat data user..." />
      ) : (
        <div style={styles.tableBox}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.tableHeaderCell}>No</th>
                <th style={styles.tableHeaderCell}>Nama</th>
                <th style={styles.tableHeaderCell}>Email</th>
                <th style={styles.tableHeaderCell}>Password</th>
                <th style={styles.tableHeaderCell}>Gender</th>
                <th style={styles.tableHeaderCell}>Alamat</th>
                <th style={styles.tableHeaderCell}>No. Telp</th>
                <th style={styles.tableHeaderCell}>Foto</th>
                <th style={styles.tableHeaderCellLast}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="9" style={styles.noDataRow}>
                    Tidak ada data User.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => {
                  const userPhotoUrl = user.foto; // Variabel untuk foto user

                  return (
                    <tr
                      key={user.id}
                      style={styles.tableRow}
                    >
                      <td style={styles.tableCell}>{index + 1}</td>
                      <td style={styles.tableCell}>{user.nama}</td>
                      <td style={styles.tableCell}>{user.email}</td>
                      <td style={styles.tableCell}>
                        <div style={styles.passwordCell}>
                          <input
                            type={showPasswordMap[user.id] ? "text" : "password"}
                            value={user.password}
                            readOnly
                            style={styles.passwordInput}
                          />
                          <span
                            onClick={() =>
                              setShowPasswordMap((prev) => ({
                                ...prev,
                                [user.id]: !prev[user.id],
                              }))
                            }
                            style={styles.passwordToggleIcon}
                          >
                            {showPasswordMap[user.id] ? <FaEyeSlash /> : <FaEye />}
                          </span>
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <span
                          style={{
                            ...styles.genderTag,
                            backgroundColor: user.gender === "Laki-laki" ? '#BBDEFB' : '#FFECB3',
                            color: user.gender === "Laki-laki" ? '#2196F3' : '#FFC107',
                          }}
                        >
                          {user.gender}
                        </span>
                      </td>
                      <td style={styles.tableCell}>{user.alamat}</td>
                      <td style={styles.tableCell}>{user.no_tlp || '-'}</td>
                      <td style={styles.tableCell}>
                        {userPhotoUrl ? (
                          <img
                            src={userPhotoUrl}
                            alt="Foto User"
                            style={styles.userPhotoImage} // Menggunakan gaya userPhotoImage
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'placeholder_image_path.jpg'; // Ganti dengan path gambar placeholder jika ada
                              e.target.alt = "Foto tidak tersedia";
                            }}
                          />
                        ) : (
                          <span style={styles.noPhotoText}>-</span>
                        )}
                      </td>
                      <td style={styles.tableCellActions}>
                        <Link
                          to={`/admin/user/edit/${user.id}`}
                          style={styles.actionButtonSmall}
                          title="Edit"
                        >
                          <FaEdit size={14} />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(user.id)}
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
            <p style={styles.modalText}>Yakin ingin menghapus User ini?</p>
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
  addDokterButton: { // Nama gaya disesuaikan agar konsisten
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
    backgroundColor: '#F5F5F5',
    borderBottom: '1px solid #E0E0E0',
    height: '60px',
    fontSize: '1em',
    color: '#424242',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  tableHeaderCell: {
    padding: '15px 20px',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: '#424242',
  },
  tableHeaderCellLast: {
    padding: '15px 20px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    color: '#424242',
  },
  tableRow: {
    borderBottom: '1px solid #ECEFF1',
    transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
    height: '70px',
    // Untuk efek hover murni, Anda perlu menambahkan onMouseEnter/onMouseLeave di JSX
    // atau menggunakan CSS-in-JS library yang mendukung pseudo-classes.
    // '&:hover': {
    //   backgroundColor: '#F5F5F5',
    // },
  },
  tableCell: {
    padding: '12px 20px',
    color: '#333',
    fontSize: '1.0em',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Gaya untuk kolom password
  passwordCell: {
    display: 'flex',
    alignItems: 'center',
  },
  passwordInput: {
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '8px 10px',
    fontSize: '0.9em',
    width: '120px', // Sesuaikan lebar input
    marginRight: '8px',
    backgroundColor: '#f8f8f8',
    color: '#555',
  },
  passwordToggleIcon: {
    cursor: 'pointer',
    color: '#666',
    fontSize: '1.1em',
    padding: '5px',
    display: 'flex', // Untuk memastikan ikon di tengah vertikal
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Gaya untuk foto user di kolom "Foto"
  userPhotoImage: {
    width: '50px',
    height: '50px',
    borderRadius: '8px',
    objectFit: 'cover',
    border: '1px solid #E0E0E0',
  },
  noPhotoText: {
    color: '#BDBDBD',
    fontStyle: 'italic',
    fontSize: '0.9em',
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
    transition: 'background-color 0.2s ease, transform 0.1s ease',
    margin: '0 4px',
    width: '32px',
    height: '32px',
    textDecoration: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    // '&:hover': {
    //   backgroundColor: '#D5D5D5',
    //   transform: 'translateY(-1px)',
    // },
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
    color: '#EF5350',
    // '&:hover': {
    //   backgroundColor: '#FFCDD2',
    // },
  },
  genderTag: {
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '0.85em',
    fontWeight: 'bold',
    display: 'inline-block',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  toggleButton: {
    fontSize: '20px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#333',
  },

  // --- NEW STYLES FOR MODAL (copied from DokterList/JanjiList) ---
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
    animation: 'fadeIn 0.3s forwards', // Membutuhkan @keyframes di App.css
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    maxWidth: '400px',
    width: '90%',
    transform: 'scale(0.9)',
    animation: 'scaleIn 0.3s forwards', // Membutuhkan @keyframes di App.css
    border: '2px solid #6A1B9A',
    position: 'relative',
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
    backgroundColor: '#DC3545',
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
    backgroundColor: '#6C757D',
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

export default UserList;